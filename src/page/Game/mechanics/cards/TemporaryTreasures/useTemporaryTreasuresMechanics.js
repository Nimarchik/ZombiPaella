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

export const useTemporaryTreasuresMechanics = (ctx) => {

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

  // TEMPORARY TREASURES
  // =========================================================

  const [
    temporaryTreasureLoading,
    setTemporaryTreasureLoading,
  ] = useState(false);

  const [
    temporaryTreasureError,
    setTemporaryTreasureError,
  ] = useState("");

  const [
    temporaryTreasurePlayingCardId,
    setTemporaryTreasurePlayingCardId,
  ] = useState(null);


  const myTemporaryTreasureIds =
    useMemo(
      () =>
        treasures
          .filter(
            treasure =>
              treasure.owner_id ===
                currentUser?.id &&
              treasure.card?.type ===
                "treasure" &&
              treasure.card?.subtype ===
                "temporary"
          )
          .map(
            treasure =>
              treasure.id
          ),
      [
        treasures,
        currentUser?.id,
      ]
    );


  const handlePlayTemporaryTreasure =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !canPlayTurn ||
        temporaryTreasureLoading
      ) {
        return;
      }


      if (
        !myTemporaryTreasureIds
          .includes(gameCardId)
      ) {
        setTemporaryTreasureError(
          "Цей тимчасовий скарб не належить тобі."
        );
        return;
      }


      setTemporaryTreasureLoading(true);
      setTemporaryTreasurePlayingCardId(
        gameCardId
      );
      setTemporaryTreasureError("");


      const {
        result,
        error,
      } =
        await playTemporaryTreasure(
          game.id,
          gameCardId
        );


      if (error) {

        console.error(
          "USE TEMPORARY TREASURE ERROR:",
          error
        );

        setTemporaryTreasureError(
          error.message
        );

        setTemporaryTreasureLoading(false);
        setTemporaryTreasurePlayingCardId(
          null
        );

        return;
      }


      console.log(
        "TEMPORARY TREASURE RESULT:",
        result
      );


      setPreviewCard(null);
      setAlmsMenuOpen(false);


      await refreshCards(
        game.id,
        currentUser.id
      );


      await loadGameState();
      await externalLoadTurnActionState?.();
      await externalLoadMyIngredientCount?.();


      setTemporaryTreasureLoading(false);
      setTemporaryTreasurePlayingCardId(
        null
      );
    };

  return {
    temporaryTreasureLoading,
    setTemporaryTreasureLoading,
    temporaryTreasureError,
    setTemporaryTreasureError,
    temporaryTreasurePlayingCardId,
    setTemporaryTreasurePlayingCardId,
    myTemporaryTreasureIds,
    handlePlayTemporaryTreasure,
  };
};
