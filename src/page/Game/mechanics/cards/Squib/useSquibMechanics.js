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

export const useSquibMechanics = (ctx) => {

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

  // SQUIB — ПЕТАРДА
  // =========================================================

  const [
    squibLoading,
    setSquibLoading,
  ] = useState(false);

  const [
    squibError,
    setSquibError,
  ] = useState("");

  const [
    squibPlayingCardId,
    setSquibPlayingCardId,
  ] = useState(null);


  const squibCard =
    useMemo(
      () =>
        hand.find(
          gameCard =>
            gameCard.card?.id ===
            "squib"
        ) ?? null,
      [hand]
    );


  const canPlaySquib =
    Boolean(
      activeBattle?.id &&
      iAmAttacker &&
      game?.phase ===
      "battle_attacker_reaction" &&
      squibCard?.id
    );

  // SQUIB — ПЕТАРДА BEFORE DEFENSE
  // =========================================================

  const handlePlaySquib =
    async () => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !activeBattle?.id ||
        !squibCard?.id ||
        !canPlaySquib ||
        squibLoading
      ) {
        return;
      }


      setSquibLoading(true);
      setSquibPlayingCardId(
        squibCard.id
      );
      setSquibError("");


      const {
        result,
        error,
      } =
        await playSquib(
          game.id,
          activeBattle.id,
          squibCard.id
        );


      if (error) {

        console.error(
          "PLAY SQUIB ERROR:",
          error
        );

        setSquibError(
          error.message
        );

        setSquibLoading(false);
        setSquibPlayingCardId(null);

        return;
      }


      console.log(
        "SQUIB RESULT:",
        result
      );


      await refreshCards(
        game.id,
        currentUser.id
      );

      const updatedGame =
        await loadGameState();


      if (
        result?.energy_reaction ||
        updatedGame?.phase ===
        "energy_reaction"
      ) {
        await loadEnergyReaction();
      }


      setSquibLoading(false);
      setSquibPlayingCardId(null);
    };


  const handlePassSquib =
    async () => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !activeBattle?.id ||
        !iAmAttacker ||
        game?.phase !==
        "battle_attacker_reaction" ||
        squibLoading
      ) {
        return;
      }


      setSquibLoading(true);
      setSquibError("");


      const {
        result,
        error,
      } =
        await passSquib(
          game.id,
          activeBattle.id
        );


      if (error) {

        console.error(
          "PASS SQUIB ERROR:",
          error
        );

        setSquibError(
          error.message
        );

        setSquibLoading(false);

        return;
      }


      console.log(
        "SQUIB PASS RESULT:",
        result
      );


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();


      setSquibLoading(false);
      setSquibPlayingCardId(null);
    };



  return {
    squibLoading,
    setSquibLoading,
    squibError,
    setSquibError,
    squibPlayingCardId,
    setSquibPlayingCardId,
    squibCard,
    canPlaySquib,
    handlePlaySquib,
    handlePassSquib,
  };
};
