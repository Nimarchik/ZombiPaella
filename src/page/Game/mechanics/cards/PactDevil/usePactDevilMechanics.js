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

export const usePactDevilMechanics = (ctx) => {

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

  const myTreasureCount = troubleMechanics?.myTreasureCount ?? 0;

  // PACT WITH DEVIL — УГОДА З ДИЯВОЛОМ
  // =========================================================

  const [
    pactCardId,
    setPactCardId,
  ] = useState(null);

  const [
    pactTargets,
    setPactTargets,
  ] = useState([]);

  const [
    pactTargetPlayerId,
    setPactTargetPlayerId,
  ] = useState(null);

  const [
    pactLoading,
    setPactLoading,
  ] = useState(false);

  const [
    pactError,
    setPactError,
  ] = useState("");


  // PACT WITH DEVIL — УГОДА З ДИЯВОЛОМ
  // =========================================================

  const openPactDevil =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        pactLoading
      ) {
        return;
      }


      if (myTreasureCount <= 0) {

        setPactError(
          "Для «Угоди з дияволом» у тебе має бути хоча б 1 скарб."
        );

        return;
      }


      setPactLoading(true);
      setPactError("");
      setPactTargetPlayerId(null);


      const {
        data,
        error,
      } =
        await getHandCounts(
          game.id
        );


      if (error) {

        console.error(
          "PACT TARGETS ERROR:",
          error
        );

        setPactError(
          error.message
        );

        setPactLoading(false);

        return;
      }


      const targets =
        (data ?? [])
          .filter(
            item =>
              item.player_id !==
              currentUser.id
          )
          .map(
            item => ({
              ...item,
              treasure_count:
                treasures.filter(
                  treasure =>
                    treasure.owner_id ===
                    item.player_id
                ).length,
            })
          );


      setPactTargets(
        targets
      );

      setPactCardId(
        gameCardId
      );

      setPreviewCard(null);
      setAlmsMenuOpen(false);


      if (targets.length === 0) {

        setPactError(
          "Немає іншого гравця для обміну."
        );

      }


      setPactLoading(false);
    };


  const closePactDevil =
    () => {

      if (pactLoading) {
        return;
      }

      setPactCardId(null);
      setPactTargets([]);
      setPactTargetPlayerId(null);
      setPactError("");
    };


  const handlePlayPactDevil =
    async () => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !pactCardId ||
        !pactTargetPlayerId ||
        pactLoading
      ) {
        return;
      }


      if (myTreasureCount <= 0) {

        setPactError(
          "У тебе більше немає скарбів. Цю карту не можна зіграти."
        );

        return;
      }


      setPactLoading(true);
      setPactError("");


      const {
        result,
        error,
      } =
        await playPactDevil(
          game.id,
          pactCardId,
          pactTargetPlayerId
        );


      if (error) {

        console.error(
          "PLAY PACT DEVIL ERROR:",
          error
        );

        setPactError(
          error.message
        );

        setPactLoading(false);

        return;
      }


      console.log(
        "PACT DEVIL RESULT:",
        result
      );


      setPactCardId(null);
      setPactTargets([]);
      setPactTargetPlayerId(null);


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


      setPactLoading(false);
    };


  // =========================================================

  return {
    pactCardId,
    setPactCardId,
    pactTargets,
    setPactTargets,
    pactTargetPlayerId,
    setPactTargetPlayerId,
    pactLoading,
    setPactLoading,
    pactError,
    setPactError,
    openPactDevil,
    closePactDevil,
    handlePlayPactDevil,
  };
};
