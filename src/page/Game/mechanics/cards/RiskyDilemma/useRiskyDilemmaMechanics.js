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

export const useRiskyDilemmaMechanics = (ctx) => {

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

  // RISKY DILEMMA
  // =========================================================

  const [
    riskyDilemmaCardId,
    setRiskyDilemmaCardId,
  ] = useState(null);

  const [
    riskyDilemmaSelectedIds,
    setRiskyDilemmaSelectedIds,
  ] = useState([]);

  const [
    riskyDilemmaLoading,
    setRiskyDilemmaLoading,
  ] = useState(false);

  const [
    riskyDilemmaError,
    setRiskyDilemmaError,
  ] = useState("");


  // RISKY DILEMMA COMPUTED
  // =========================================================

  const riskyDilemmaCards =
    useMemo(() => {

      return hand.filter(
        gameCard =>
          gameCard.id !==
          riskyDilemmaCardId
      );

    }, [
      hand,
      riskyDilemmaCardId,
    ]);


  // =========================================================

  // RISKY DILEMMA
  // =========================================================

  const toggleRiskyDilemmaCard =
    cardId => {

      setRiskyDilemmaError("");


      setRiskyDilemmaSelectedIds(
        current => {

          if (
            current.includes(cardId)
          ) {
            return current.filter(
              id =>
                id !== cardId
            );
          }


          if (
            current.length >= 5
          ) {

            setRiskyDilemmaError(
              "Можна вибрати максимум 5 карт"
            );

            return current;
          }


          return [
            ...current,
            cardId,
          ];
        }
      );
    };


  const openRiskyDilemma =
    gameCardId => {

      setRiskyDilemmaCardId(
        gameCardId
      );

      setRiskyDilemmaSelectedIds([]);
      setRiskyDilemmaError("");

      setPreviewCard(null);
      setAlmsMenuOpen(false);
    };


  const closeRiskyDilemma =
    () => {

      if (riskyDilemmaLoading) {
        return;
      }

      setRiskyDilemmaCardId(null);
      setRiskyDilemmaSelectedIds([]);
      setRiskyDilemmaError("");
    };


  const handlePlayRiskyDilemma =
    async () => {

      if (
        !game ||
        !currentUser ||
        !riskyDilemmaCardId ||
        riskyDilemmaLoading ||
        !canPlayTurn
      ) {
        return;
      }


      setRiskyDilemmaLoading(true);
      setRiskyDilemmaError("");


      const {
        result,
        error,
      } =
        await playPlayerPetrer(
          game.id,
          riskyDilemmaCardId,
          riskyDilemmaSelectedIds
        );


      if (error) {

        console.error(
          "RISKY DILEMMA ERROR:",
          error
        );

        setRiskyDilemmaError(
          error.message
        );

        setRiskyDilemmaLoading(false);

        return;
      }


      console.log(
        "RISKY DILEMMA RESULT:",
        result
      );


      setRiskyDilemmaCardId(null);
      setRiskyDilemmaSelectedIds([]);


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();


      setRiskyDilemmaLoading(false);
    };


  // =========================================================

  return {
    riskyDilemmaCardId,
    setRiskyDilemmaCardId,
    riskyDilemmaSelectedIds,
    setRiskyDilemmaSelectedIds,
    riskyDilemmaLoading,
    setRiskyDilemmaLoading,
    riskyDilemmaError,
    setRiskyDilemmaError,
    riskyDilemmaCards,
    toggleRiskyDilemmaCard,
    openRiskyDilemma,
    closeRiskyDilemma,
    handlePlayRiskyDilemma,
  };
};
