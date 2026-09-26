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

export const useBatMechanics = (ctx) => {

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

  // BAT
  // =========================================================

  const [
    batCardId,
    setBatCardId,
  ] = useState(null);

  const [
    batSelectingTreasure,
    setBatSelectingTreasure,
  ] = useState(false);

  const [
    batTarget,
    setBatTarget,
  ] = useState(null);

  const [
    batLoading,
    setBatLoading,
  ] = useState(false);

  const [
    batError,
    setBatError,
  ] = useState("");


  // BAT
  // =========================================================

  const openBat =
    gameCardId => {

      setSelectingTreasure(false);
      setAttackCardId(null);
      setAttackSupportCardIds([]);

      setBatCardId(
        gameCardId
      );

      setBatSelectingTreasure(true);
      setBatTarget(null);
      setBatError("");

      setPreviewCard(null);
      setAlmsMenuOpen(false);
    };


  const closeBat =
    () => {

      if (batLoading) {
        return;
      }

      setBatCardId(null);
      setBatTarget(null);
      setBatSelectingTreasure(false);
      setBatError("");
    };


  const handlePlayBat =
    async () => {

      if (
        !game ||
        !currentUser ||
        !batCardId ||
        !batTarget ||
        batLoading ||
        !canPlayTurn
      ) {
        return;
      }


      setBatLoading(true);
      setBatError("");


      const {
        result,
        error,
      } =
        await playBat(
          game.id,
          batCardId,
          batTarget.id
        );


      if (error) {

        console.error(
          "BAT ERROR:",
          error
        );

        setBatError(
          error.message
        );

        setBatLoading(false);

        return;
      }


      console.log(
        "BAT RESULT:",
        result
      );


      setBatCardId(null);
      setBatTarget(null);
      setBatSelectingTreasure(false);


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();


      setBatLoading(false);
    };


  // =========================================================

  return {
    batCardId,
    setBatCardId,
    batSelectingTreasure,
    setBatSelectingTreasure,
    batTarget,
    setBatTarget,
    batLoading,
    setBatLoading,
    batError,
    setBatError,
    openBat,
    closeBat,
    handlePlayBat,
  };
};
