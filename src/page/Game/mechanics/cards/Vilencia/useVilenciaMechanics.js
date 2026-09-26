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

export const useVilenciaMechanics = (ctx) => {

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

  // VILENCIA — МІСЯЦЬ НАД ВАЛЕНСІЄЮ
  // =========================================================

  const [
    vilenciaLoading,
    setVilenciaLoading,
  ] = useState(false);

  const [
    vilenciaError,
    setVilenciaError,
  ] = useState("");

  const [
    vilenciaPlayingCardId,
    setVilenciaPlayingCardId,
  ] = useState(null);


  // VILENCIA — МІСЯЦЬ НАД ВАЛЕНСІЄЮ
  // =========================================================

  const handlePlayVilencia =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !canPlayTurn ||
        vilenciaLoading
      ) {
        return;
      }


      setVilenciaLoading(true);
      setVilenciaPlayingCardId(
        gameCardId
      );
      setVilenciaError("");


      const {
        result,
        error,
      } =
        await playVilencia(
          game.id,
          gameCardId
        );


      if (error) {

        console.error(
          "VILENCIA ERROR:",
          error
        );

        setVilenciaError(
          error.message
        );

        setVilenciaLoading(false);
        setVilenciaPlayingCardId(null);

        return;
      }


      console.log(
        "VILENCIA RESULT:",
        result
      );


      setPreviewCard(null);
      setAlmsMenuOpen(false);


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();


      setVilenciaLoading(false);
      setVilenciaPlayingCardId(null);
    };


  // =========================================================

  return {
    vilenciaLoading,
    setVilenciaLoading,
    vilenciaError,
    setVilenciaError,
    vilenciaPlayingCardId,
    setVilenciaPlayingCardId,
    handlePlayVilencia,
  };
};
