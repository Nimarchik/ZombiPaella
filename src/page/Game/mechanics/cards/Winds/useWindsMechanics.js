import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  startBattle,
  startGroupOpenBattle,
  respondBattle,
  getBattleResultDetails,
  claimBonusTreasure,
  playPlayerPetrer,
  playBat,
  playVilencia,
  getHandCounts,
  startChicken,
  getActiveChicken,
  resolveChicken,
  startElf,
  getActiveElf,
  resolveElf,
  getElixirOptions,
  playElixir,
  getActiveBattleReaction,
  passBattleReaction,
  playChatter,
  finalizeBattleReactions,
  getActiveEnergyReaction,
  passEnergyReaction,
  playProtection,
  playUltraprotection,
  playRice,
  playSpy,
  getActiveSpyReveal,
  playSquib,
  passSquib,
  playFortress,
  getActiveFortresses,
  playStatue,
  getActiveStatues,
  getActiveBattleGuardChoice,
  chooseBattleGuard,
  playTrouble,
  playSilkTrade,
  playDoubleAction,
  getTurnActionState,
  playWinds,
  playPactDevil,
  getEffectiveIngredientCount,
  playTemporaryTreasure,
  playMajorFlood,
} from "../../../../../services/gameService";

import {
  supabase,
} from "../../../../../services/supabase";

export const useWindsMechanics = (ctx) => {

  const {
    game,
    currentUser,
    hand,
    treasures,
    activeBattle,
    setActiveBattle,
    canPlayTurn,
    refreshCards,
    loadActiveBattle,
    loadGameState,
    setPreviewCard,
    setAlmsMenuOpen,

    attackCardId,
    setAttackCardId,
    attackMode,
    setAttackMode,
    selectingTreasure,
    setSelectingTreasure,
    battleLoading,
    setBattleLoading,
    battleError,
    setBattleError,
    draggedBattleCardId,
    setDraggedBattleCardId,
    hoveredTreasureId,
    setHoveredTreasureId,
    selectedTarget,
    setSelectedTarget,
    battleResult,
    setBattleResult,

    attackSupportCardIds,
    setAttackSupportCardIds,
    selectedDefenseCardId,
    setSelectedDefenseCardId,
    defenseSupportCardIds,
    setDefenseSupportCardIds,

    canAttackWithBattleCard,
    canDefendWithBattleCard,
    iAmDefender,
    iAmAttacker,

    loadEnergyReaction,
    loadTurnActionState: externalLoadTurnActionState,
    loadMyIngredientCount: externalLoadMyIngredientCount,
    loadFortresses: externalLoadFortresses,
    loadStatues: externalLoadStatues,
    loadBattleGuardChoice: externalLoadBattleGuardChoice,
    runtimeFns,

    batMechanics,
    troubleMechanics,
  } = ctx;

  // TRADING WINDS — ТОРГОВЕЛЬНІ ВІТРИ
  // =========================================================

  const [
    windsCardId,
    setWindsCardId,
  ] = useState(null);

  const [
    windsMyTreasureId,
    setWindsMyTreasureId,
  ] = useState(null);

  const [
    windsTargetTreasureId,
    setWindsTargetTreasureId,
  ] = useState(null);

  const [
    windsLoading,
    setWindsLoading,
  ] = useState(false);

  const [
    windsError,
    setWindsError,
  ] = useState("");


  // TRADING WINDS — ТОРГОВЕЛЬНІ ВІТРИ
  // =========================================================

  const windsOwnTreasures =
    useMemo(
      () =>
        treasures.filter(
          treasure =>
            treasure.owner_id ===
            currentUser?.id
        ),
      [
        treasures,
        currentUser?.id,
      ]
    );


  const windsOpponentTreasures =
    useMemo(
      () =>
        treasures.filter(
          treasure =>
            treasure.owner_id &&
            treasure.owner_id !==
              currentUser?.id
        ),
      [
        treasures,
        currentUser?.id,
      ]
    );


  const openWinds =
    gameCardId => {

      if (
        !gameCardId ||
        windsLoading
      ) {
        return;
      }

      setWindsCardId(gameCardId);
      setWindsMyTreasureId(null);
      setWindsTargetTreasureId(null);
      setWindsError("");

      setPreviewCard(null);
      setAlmsMenuOpen(false);
    };


  const closeWinds =
    () => {

      if (windsLoading) {
        return;
      }

      setWindsCardId(null);
      setWindsMyTreasureId(null);
      setWindsTargetTreasureId(null);
      setWindsError("");
    };


  const handlePlayWinds =
    async () => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !windsCardId ||
        windsLoading
      ) {
        return;
      }


      if (
        !windsMyTreasureId ||
        !windsTargetTreasureId
      ) {

        setWindsError(
          "Обери 1 свій скарб та 1 скарб іншого гравця."
        );

        return;
      }


      setWindsLoading(true);
      setWindsError("");


      const {
        result,
        error,
      } =
        await playWinds(
          game.id,
          windsCardId,
          windsMyTreasureId,
          windsTargetTreasureId
        );


      if (error) {

        console.error(
          "PLAY WINDS ERROR:",
          error
        );

        setWindsError(
          error.message
        );

        setWindsLoading(false);

        return;
      }


      console.log(
        "WINDS RESULT:",
        result
      );


      setWindsCardId(null);
      setWindsMyTreasureId(null);
      setWindsTargetTreasureId(null);


      await refreshCards(
        game.id,
        currentUser.id
      );


      const updatedGame =
        await loadGameState();


      await externalLoadTurnActionState?.();


      if (
        result?.energy_reaction ||
        updatedGame?.phase ===
          "energy_reaction"
      ) {
        await loadEnergyReaction();
      }


      setWindsLoading(false);
    };


  // =========================================================

  return {
    windsCardId,
    setWindsCardId,
    windsMyTreasureId,
    setWindsMyTreasureId,
    windsTargetTreasureId,
    setWindsTargetTreasureId,
    windsLoading,
    setWindsLoading,
    windsError,
    setWindsError,
    windsOwnTreasures,
    windsOpponentTreasures,
    openWinds,
    closeWinds,
    handlePlayWinds,
  };
};
