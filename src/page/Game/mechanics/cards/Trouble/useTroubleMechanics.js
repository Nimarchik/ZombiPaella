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

export const useTroubleMechanics = (ctx) => {

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

  // TROUBLE — КРИВАВА БИТВА
  // =========================================================

  const [
    troubleCardId,
    setTroubleCardId,
  ] = useState(null);

  const [
    troubleLoading,
    setTroubleLoading,
  ] = useState(false);

  const [
    troubleError,
    setTroubleError,
  ] = useState("");


  // TROUBLE — КРИВАВА БИТВА
  // =========================================================

  const myTreasureCount =
    useMemo(
      () =>
        treasures.filter(
          treasure =>
            treasure.owner_id ===
            currentUser?.id
        ).length,
      [
        treasures,
        currentUser?.id,
      ]
    );


  const troubleAttackCards =
    useMemo(
      () =>
        hand.filter(
          gameCard =>
            gameCard.id !==
            troubleCardId &&
            canAttackWithBattleCard(
              gameCard.card
            )
        ),
      [
        hand,
        troubleCardId,
      ]
    );


  const openTrouble =
    gameCardId => {

      if (
        !gameCardId ||
        troubleLoading
      ) {
        return;
      }

      setTroubleCardId(
        gameCardId
      );

      setTroubleError("");
      setBattleError("");

      setAttackCardId(null);
      setAttackMode("normal");
      setAttackSupportCardIds([]);
      setSelectingTreasure(false);
      setDraggedBattleCardId(null);
      setHoveredTreasureId(null);
      setSelectedTarget(null);

      batMechanics?.setBatCardId?.(null);
      batMechanics?.setBatTarget?.(null);
      batMechanics?.setBatSelectingTreasure?.(false);

      setPreviewCard(null);
      setAlmsMenuOpen(false);
    };


  const closeTrouble =
    () => {

      if (
        troubleLoading ||
        battleLoading
      ) {
        return;
      }

      setTroubleCardId(null);
      setTroubleError("");

      setSelectingTreasure(false);
      setAttackCardId(null);
      setAttackMode("normal");
      setAttackSupportCardIds([]);
      setDraggedBattleCardId(null);
      setHoveredTreasureId(null);
      setSelectedTarget(null);
      setBattleError("");
    };


  const beginTroubleAttack =
    gameCardId => {

      if (
        !troubleCardId ||
        !gameCardId ||
        troubleLoading
      ) {
        return;
      }

      setAttackCardId(
        gameCardId
      );

      setAttackMode(
        "trouble"
      );

      setAttackSupportCardIds([]);
      setSelectingTreasure(true);
      setSelectedTarget(null);
      setBattleError("");
      setTroubleError("");
    };


  // =========================================================

  return {
    troubleCardId,
    setTroubleCardId,
    troubleLoading,
    setTroubleLoading,
    troubleError,
    setTroubleError,
    troubleAttackCards,
    myTreasureCount,
    openTrouble,
    closeTrouble,
    beginTroubleAttack,
  };
};
