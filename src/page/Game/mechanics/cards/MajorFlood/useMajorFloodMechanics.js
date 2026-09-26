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

export const useMajorFloodMechanics = (ctx) => {

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

  // MAJOR FLOOD — ВЕЛИКА ПОВІНЬ
  // =========================================================

  const [
    majorFloodLoading,
    setMajorFloodLoading,
  ] = useState(false);

  const [
    majorFloodError,
    setMajorFloodError,
  ] = useState("");

  const [
    majorFloodPlayingCardId,
    setMajorFloodPlayingCardId,
  ] = useState(null);


  // MAJOR FLOOD — ВЕЛИКА ПОВІНЬ
  // =========================================================

  const handlePlayMajorFlood =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !canPlayTurn ||
        majorFloodLoading
      ) {
        return;
      }


      setMajorFloodLoading(true);
      setMajorFloodPlayingCardId(
        gameCardId
      );
      setMajorFloodError("");


      const {
        result,
        error,
      } =
        await playMajorFlood(
          game.id,
          gameCardId
        );


      if (error) {

        console.error(
          "PLAY MAJOR FLOOD ERROR:",
          error
        );

        setMajorFloodError(
          error.message
        );

        setMajorFloodLoading(false);
        setMajorFloodPlayingCardId(null);

        return;
      }


      console.log(
        "MAJOR FLOOD RESULT:",
        result
      );


      setPreviewCard(null);
      setAlmsMenuOpen(false);


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();


      setMajorFloodLoading(false);
      setMajorFloodPlayingCardId(null);
    };


  // =========================================================

  return {
    majorFloodLoading,
    setMajorFloodLoading,
    majorFloodError,
    setMajorFloodError,
    majorFloodPlayingCardId,
    setMajorFloodPlayingCardId,
    handlePlayMajorFlood,
  };
};
