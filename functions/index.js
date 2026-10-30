/**
 * Cloud Functions for GORILLAZ GYM – THE CHAMPION CHALLENGE
 * Backend validation for matches, attempts, rankings, and admin actions.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * 1. Callable Cloud Function: validateAndRecordGame
 * Verifies scores, attempt limits and persists game atomically on server
 */
exports.validateAndRecordGame = onCall(async (request) => {
  const data = request.data || {};
  const {
    participantId,
    dni,
    name,
    nickname,
    level1Score = 0,
    level2Score = 0,
    level3Score = 0,
    speedBonus = 0,
    streakBonus = 0,
    duration = 0,
  } = data;

  // Validation
  if (!dni || typeof dni !== "string" || !/^\d{7,8}$/.test(dni.trim())) {
    throw new HttpsError("invalid-argument", "DNI inválido (debe contener 7 u 8 dígitos numéricos).");
  }

  if (!name || typeof name !== "string" || name.trim().length < 3) {
    throw new HttpsError("invalid-argument", "Nombre y apellido inválido.");
  }

  // Score boundaries check (prevents tampering)
  if (level1Score < 0 || level1Score > 50) {
    throw new HttpsError("invalid-argument", "Puntaje de Nivel 1 fuera de los límites permitidos (máx 50 pts).");
  }
  if (level2Score < 0 || level2Score > 100) {
    throw new HttpsError("invalid-argument", "Puntaje base de Nivel 2 fuera de límites (máx 100 pts).");
  }
  if (level3Score < 0 || level3Score > 150) {
    throw new HttpsError("invalid-argument", "Puntaje base de Nivel 3 fuera de límites (máx 150 pts).");
  }
  if (speedBonus < 0 || speedBonus > 50) {
    throw new HttpsError("invalid-argument", "Bonificación por rapidez inválida.");
  }
  if (streakBonus < 0 || streakBonus > 30) {
    throw new HttpsError("invalid-argument", "Bonificación de racha inválida.");
  }

  const calculatedTotal = level1Score + level2Score + level3Score + speedBonus + streakBonus;

  // 1. Fetch tournament settings
  const settingsDoc = await db.collection("settings").doc("game_config").get();
  const settings = settingsDoc.exists ? settingsDoc.data() : { maxAttempts: 3, unlimitedAttempts: false, competitionEnabled: true };

  if (settings.competitionEnabled === false) {
    throw new HttpsError("failed-precondition", "El torneo se encuentra actualmente pausado.");
  }

  // 2. Fetch or create participant doc
  const partDocRef = db.collection("participants").doc(participantId || ("part_" + dni.trim()));
  const partSnap = await partDocRef.get();

  let participant = partSnap.exists ? partSnap.data() : null;

  if (!participant) {
    // New participant
    participant = {
      id: partDocRef.id,
      name: name.trim(),
      dni: dni.trim(),
      nickname: nickname ? nickname.trim() : "",
      attemptsUsed: 0,
      bestScore: 0,
      lastScore: 0,
      bestTimeSeconds: 0,
      createdAt: new Date().toISOString(),
      lastPlayedAt: new Date().toISOString(),
      active: true,
    };
  }

  if (participant.active === false) {
    throw new HttpsError("permission-denied", "El participante se encuentra suspendido por el administrador.");
  }

  // Check attempt limit
  if (!settings.unlimitedAttempts && participant.attemptsUsed >= settings.maxAttempts) {
    throw new HttpsError("resource-exhausted", "Ya utilizaste todos tus intentos permitidos.");
  }

  const attemptNumber = (participant.attemptsUsed || 0) + 1;
  const now = new Date().toISOString();
  const gameId = "game_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);

  const gameRecord = {
    id: gameId,
    participantId: partDocRef.id,
    dni: dni.trim(),
    name: name.trim(),
    nickname: nickname ? nickname.trim() : participant.nickname || "",
    level1Score,
    level2Score,
    level3Score,
    speedBonus,
    streakBonus,
    totalScore: calculatedTotal,
    duration: Math.max(1, duration),
    attemptNumber,
    completedAt: now,
    status: "completado",
  };

  // Determine best score & best time
  const isBetterScore = calculatedTotal > (participant.bestScore || 0);
  const isTiedWithBetterTime =
    calculatedTotal === (participant.bestScore || 0) &&
    (participant.bestTimeSeconds <= 0 || duration < participant.bestTimeSeconds);

  const updatedBestScore = isBetterScore ? calculatedTotal : (participant.bestScore || calculatedTotal);
  const updatedBestTime = (isBetterScore || isTiedWithBetterTime) ? duration : (participant.bestTimeSeconds || duration);

  // Atomic batch write
  const batch = db.batch();
  batch.set(db.collection("games").doc(gameId), gameRecord);
  batch.set(
    partDocRef,
    {
      ...participant,
      name: name.trim(),
      nickname: nickname ? nickname.trim() : participant.nickname || "",
      attemptsUsed: attemptNumber,
      lastScore: calculatedTotal,
      bestScore: updatedBestScore,
      bestTimeSeconds: updatedBestTime,
      lastPlayedAt: now,
    },
    { merge: true }
  );

  await batch.commit();

  return {
    success: true,
    gameId,
    attemptNumber,
    totalScore: calculatedTotal,
    bestScore: updatedBestScore,
  };
});

/**
 * 2. Callable Cloud Function: checkParticipantAttempts
 * Checks if a participant can play and returns remaining count
 */
exports.checkParticipantAttempts = onCall(async (request) => {
  const dni = (request.data && request.data.dni) ? String(request.data.dni).trim() : "";

  if (!dni || !/^\d{7,8}$/.test(dni)) {
    throw new HttpsError("invalid-argument", "DNI inválido.");
  }

  const [settingsDoc, partQuery] = await Promise.all([
    db.collection("settings").doc("game_config").get(),
    db.collection("participants").where("dni", "==", dni).limit(1).get(),
  ]);

  const settings = settingsDoc.exists ? settingsDoc.data() : { maxAttempts: 3, unlimitedAttempts: false, competitionEnabled: true };
  const participant = !partQuery.empty ? partQuery.docs[0].data() : null;

  if (settings.competitionEnabled === false) {
    return {
      canPlay: false,
      reason: "COMPETITION_PAUSED",
      message: "El torneo se encuentra temporalmente en pausa.",
      attemptsUsed: participant ? participant.attemptsUsed : 0,
      remainingAttempts: 0,
      bestScore: participant ? participant.bestScore : 0,
    };
  }

  if (participant && participant.active === false) {
    return {
      canPlay: false,
      reason: "SUSPENDED",
      message: "Tu usuario ha sido suspendido por la administración.",
      attemptsUsed: participant.attemptsUsed,
      remainingAttempts: 0,
      bestScore: participant.bestScore,
    };
  }

  if (settings.unlimitedAttempts) {
    return {
      canPlay: true,
      reason: "UNLIMITED",
      message: "INTENTOS ILIMITADOS DISPONIBLES",
      attemptsUsed: participant ? participant.attemptsUsed : 0,
      remainingAttempts: Infinity,
      bestScore: participant ? participant.bestScore : 0,
    };
  }

  const attemptsUsed = participant ? (participant.attemptsUsed || 0) : 0;
  const remaining = Math.max(0, settings.maxAttempts - attemptsUsed);
  const canPlay = remaining > 0;

  return {
    canPlay,
    reason: canPlay ? "ALLOWED" : "EXHAUSTED",
    message: canPlay ? (remaining === 1 ? "TE QUEDA 1 INTENTO" : `TE QUEDAN ${remaining} INTENTOS`) : "YA UTILIZASTE TODOS TUS INTENTOS",
    attemptsUsed,
    remainingAttempts: remaining,
    bestScore: participant ? participant.bestScore : 0,
  };
});

/**
 * 3. Firestore Trigger: Audit logging on newly created game records
 */
exports.onGameCreated = onDocumentCreated("games/{gameId}", async (event) => {
  const game = event.data.data();
  if (!game) return null;

  try {
    await db.collection("adminLogs").add({
      adminId: "system_trigger",
      action: "GAME_RECORDED",
      participantId: game.participantId,
      totalScore: game.totalScore,
      attemptNumber: game.attemptNumber,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error creating audit log:", err);
  }
  return null;
});
