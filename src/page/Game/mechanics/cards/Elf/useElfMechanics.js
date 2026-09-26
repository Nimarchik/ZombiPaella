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

export const useElfMechanics = (ctx) => {

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

  // ELF — ДОПИТЛИВИЙ ЕЛЬФ
  // =========================================================

  const [
    elfSession,
    setElfSession,
  ] = useState(null);

  const [
    elfSelectedCardId,
    setElfSelectedCardId,
  ] = useState(null);

  const [
    elfLoading,
    setElfLoading,
  ] = useState(false);

  const [
    elfError,
    setElfError,
  ] = useState("");


  // ELF — ДОПИТЛИВИЙ ЕЛЬФ
  // =========================================================

  const loadElf =
    useCallback(
      async () => {

        if (
          !game?.id ||
          !currentUser?.id
        ) {
          setElfSession(null);
          return;
        }


        const {
          data,
          error,
        } =
          await getActiveElf(
            game.id
          );


        if (error) {

          console.error(
            "GET ACTIVE ELF ERROR:",
            error
          );

          setElfError(
            error.message
          );

          return;
        }


        if (data?.active) {
          setElfSession(data);
        } else {
          setElfSession(null);
        }

      },
      [
        game?.id,
        currentUser?.id,
      ]
    );


  useEffect(() => {

    if (
      !game?.id ||
      !currentUser?.id
    ) {
      return;
    }


    if (
      game?.phase ===
      "elf_select"
    ) {

      loadElf();

      return;
    }


    setElfSession(null);
    setElfSelectedCardId(null);
    setElfError("");

  }, [
    game?.id,
    game?.phase,
    currentUser?.id,
    loadElf,
  ]);


  const handleStartElf =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !canPlayTurn ||
        elfLoading
      ) {
        return;
      }


      setElfLoading(true);
      setElfError("");
      setElfSelectedCardId(null);


      const {
        result,
        error,
      } =
        await startElf(
          game.id,
          gameCardId
        );


      if (error) {

        console.error(
          "START ELF ERROR:",
          error
        );

        setElfError(
          error.message
        );

        setElfLoading(false);

        return;
      }


      console.log(
        "ELF STARTED:",
        result
      );


      setElfSession(
        result
          ? {
            ...result,
            can_choose: true,
          }
          : null
      );

      setPreviewCard(null);
      setAlmsMenuOpen(false);


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();


      setElfLoading(false);
    };


  const handleResolveElf =
    async () => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !elfSession?.active ||
        !elfSession?.can_choose ||
        !elfSelectedCardId ||
        elfLoading
      ) {
        return;
      }


      setElfLoading(true);
      setElfError("");


      const {
        result,
        error,
      } =
        await resolveElf(
          game.id,
          elfSelectedCardId
        );


      if (error) {

        console.error(
          "RESOLVE ELF ERROR:",
          error
        );

        setElfError(
          error.message
        );

        setElfLoading(false);

        return;
      }


      console.log(
        "ELF RESULT:",
        result
      );


      setElfSession(null);
      setElfSelectedCardId(null);

      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();


      setElfLoading(false);
    };


  // =========================================================

  return {
    elfSession,
    setElfSession,
    elfSelectedCardId,
    setElfSelectedCardId,
    elfLoading,
    setElfLoading,
    elfError,
    setElfError,
    loadElf,
    handleStartElf,
    handleResolveElf,
  };
};
