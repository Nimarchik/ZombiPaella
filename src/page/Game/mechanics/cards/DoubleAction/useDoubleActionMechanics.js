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

export const useDoubleActionMechanics = (ctx) => {

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

  // DOUBLE ACTION — ПОДВІЙНІ НЕПРИЄМНОСТІ
  // =========================================================

  const [
    turnActionState,
    setTurnActionState,
  ] = useState(null);

  const [
    doubleActionLoading,
    setDoubleActionLoading,
  ] = useState(false);

  const [
    doubleActionError,
    setDoubleActionError,
  ] = useState("");

  const [
    doubleActionPlayingCardId,
    setDoubleActionPlayingCardId,
  ] = useState(null);


  // DOUBLE ACTION — ПОДВІЙНІ НЕПРИЄМНОСТІ
  // =========================================================

  const loadTurnActionState =
    useCallback(
      async () => {

        if (
          !game?.id ||
          !currentUser?.id
        ) {
          setTurnActionState(null);
          return null;
        }


        const {
          data,
          error,
        } =
          await getTurnActionState(
            game.id
          );


        if (error) {

          console.error(
            "GET TURN ACTION STATE ERROR:",
            error
          );

          return null;
        }


        setTurnActionState(
          data ?? null
        );

        return data ?? null;
      },
      [
        game?.id,
        currentUser?.id,
      ]
    );


  // Reload on every refreshed game object. This is important because
  // during a Double Action chain current_player_id may stay unchanged
  // while actions_remaining goes 2 -> 1.
  useEffect(() => {
    loadTurnActionState();
  }, [
    game,
    loadTurnActionState,
  ]);


  const handlePlayDoubleAction =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !canPlayTurn ||
        doubleActionLoading
      ) {
        return;
      }


      setDoubleActionLoading(true);
      setDoubleActionPlayingCardId(
        gameCardId
      );
      setDoubleActionError("");


      const {
        result,
        error,
      } =
        await playDoubleAction(
          game.id,
          gameCardId
        );


      if (error) {

        console.error(
          "PLAY DOUBLE ACTION ERROR:",
          error
        );

        setDoubleActionError(
          error.message
        );

        setDoubleActionLoading(false);
        setDoubleActionPlayingCardId(null);

        return;
      }


      console.log(
        "DOUBLE ACTION RESULT:",
        result
      );


      setPreviewCard(null);
      setAlmsMenuOpen(false);


      await refreshCards(
        game.id,
        currentUser.id
      );


      const updatedGame =
        await loadGameState();


      await loadTurnActionState();


      if (
        result?.energy_reaction ||
        updatedGame?.phase ===
          "energy_reaction"
      ) {
        await loadEnergyReaction();
      }


      setDoubleActionLoading(false);
      setDoubleActionPlayingCardId(null);
    };

  return {
    turnActionState,
    setTurnActionState,
    doubleActionLoading,
    setDoubleActionLoading,
    doubleActionError,
    setDoubleActionError,
    doubleActionPlayingCardId,
    setDoubleActionPlayingCardId,
    loadTurnActionState,
    handlePlayDoubleAction,
  };
};
