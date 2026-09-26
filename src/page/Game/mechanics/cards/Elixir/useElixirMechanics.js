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

export const useElixirMechanics = (ctx) => {

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

  // ELIXIR — ДУХОВНИЙ ЕЛІКСИР
  // =========================================================

  const [
    elixirCardId,
    setElixirCardId,
  ] = useState(null);

  const [
    elixirOptions,
    setElixirOptions,
  ] = useState([]);

  const [
    elixirSelectedCardId,
    setElixirSelectedCardId,
  ] = useState(null);

  const [
    elixirLoading,
    setElixirLoading,
  ] = useState(false);

  const [
    elixirError,
    setElixirError,
  ] = useState("");


  // ELIXIR — ДУХОВНИЙ ЕЛІКСИР
  // =========================================================

  const openElixir =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !canPlayTurn ||
        elixirLoading
      ) {
        return;
      }


      setElixirLoading(true);
      setElixirError("");
      setElixirSelectedCardId(null);


      const {
        data,
        error,
      } =
        await getElixirOptions(
          game.id
        );


      if (error) {

        console.error(
          "GET ELIXIR OPTIONS ERROR:",
          error
        );

        setElixirError(
          error.message
        );

        setElixirLoading(false);

        return;
      }


      const cards =
        Array.isArray(
          data?.cards
        )
          ? data.cards
          : [];


      setElixirCardId(
        gameCardId
      );

      setElixirOptions(
        cards
      );

      setPreviewCard(null);
      setAlmsMenuOpen(false);


      if (
        cards.length === 0
      ) {
        setElixirError(
          "У кладовищі немає бойових карт."
        );
      }


      setElixirLoading(false);
    };


  const closeElixir =
    () => {

      if (elixirLoading) {
        return;
      }


      setElixirCardId(null);
      setElixirOptions([]);
      setElixirSelectedCardId(null);
      setElixirError("");
    };


  const handlePlayElixir =
    async () => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !elixirCardId ||
        !elixirSelectedCardId ||
        !canPlayTurn ||
        elixirLoading
      ) {
        return;
      }


      setElixirLoading(true);
      setElixirError("");


      const {
        result,
        error,
      } =
        await playElixir(
          game.id,
          elixirCardId,
          elixirSelectedCardId
        );


      if (error) {

        console.error(
          "PLAY ELIXIR ERROR:",
          error
        );

        setElixirError(
          error.message
        );

        setElixirLoading(false);

        return;
      }


      console.log(
        "ELIXIR RESULT:",
        result
      );


      setElixirCardId(null);
      setElixirOptions([]);
      setElixirSelectedCardId(null);

      setPreviewCard(null);
      setAlmsMenuOpen(false);


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();


      setElixirLoading(false);
    };


  // =========================================================

  return {
    elixirCardId,
    setElixirCardId,
    elixirOptions,
    setElixirOptions,
    elixirSelectedCardId,
    setElixirSelectedCardId,
    elixirLoading,
    setElixirLoading,
    elixirError,
    setElixirError,
    openElixir,
    closeElixir,
    handlePlayElixir,
  };
};
