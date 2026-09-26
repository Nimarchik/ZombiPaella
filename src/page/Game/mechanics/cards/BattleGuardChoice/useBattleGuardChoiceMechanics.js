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

export const useBattleGuardChoiceMechanics = (ctx) => {

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

  // BATTLE GUARD CHOICE
  // =========================================================

  const [
    battleGuardChoice,
    setBattleGuardChoice,
  ] = useState(null);

  const [
    battleGuardChoiceLoading,
    setBattleGuardChoiceLoading,
  ] = useState(false);

  const [
    battleGuardChoiceError,
    setBattleGuardChoiceError,
  ] = useState("");


  // BATTLE GUARD CHOICE — STATUE / FORTRESS
  // =========================================================

  const loadBattleGuardChoice =
    useCallback(
      async () => {

        if (
          !game?.id ||
          !currentUser?.id
        ) {
          setBattleGuardChoice(null);
          return null;
        }

        const {
          data,
          error,
        } =
          await getActiveBattleGuardChoice(
            game.id
          );

        if (error) {
          console.error(
            "GET BATTLE GUARD CHOICE ERROR:",
            error
          );
          setBattleGuardChoiceError(
            error.message
          );
          return null;
        }

        const next =
          data?.active
            ? data
            : null;

        setBattleGuardChoice(
          next
        );

        return next;
      },
      [
        game?.id,
        currentUser?.id,
      ]
    );


  const handleChooseBattleGuard =
    async guardCardId => {

      if (
        !battleGuardChoice?.active ||
        !battleGuardChoice?.can_choose ||
        !battleGuardChoice?.battle_id ||
        !guardCardId ||
        battleGuardChoiceLoading
      ) {
        return;
      }

      setBattleGuardChoiceLoading(true);
      setBattleGuardChoiceError("");

      const battleId =
        battleGuardChoice.battle_id;

      const {
        result,
        error,
      } =
        await chooseBattleGuard(
          battleId,
          guardCardId
        );

      if (error) {
        console.error(
          "CHOOSE BATTLE GUARD ERROR:",
          error
        );
        setBattleGuardChoiceError(
          error.message
        );
        setBattleGuardChoiceLoading(false);
        return;
      }

      console.log(
        "BATTLE GUARD CHOSEN:",
        result
      );

      setBattleGuardChoice(null);

      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();
      await externalLoadFortresses?.();
      await externalLoadStatues?.();

      await runtimeFns.loadBattleResult?.(battleId);

      setBattleGuardChoiceLoading(false);
    };


  // =========================================================

  return {
    battleGuardChoice,
    setBattleGuardChoice,
    battleGuardChoiceLoading,
    setBattleGuardChoiceLoading,
    battleGuardChoiceError,
    setBattleGuardChoiceError,
    loadBattleGuardChoice,
    handleChooseBattleGuard,
  };
};
