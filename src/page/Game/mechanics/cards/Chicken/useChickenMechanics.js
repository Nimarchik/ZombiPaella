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

export const useChickenMechanics = (ctx) => {

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

  // CHICKEN — ГОЛОДНА КУРКА
  // =========================================================

  const [
    chickenCardId,
    setChickenCardId,
  ] = useState(null);

  const [
    chickenTargets,
    setChickenTargets,
  ] = useState([]);

  const [
    chickenSession,
    setChickenSession,
  ] = useState(null);

  const [
    chickenSelectedSlots,
    setChickenSelectedSlots,
  ] = useState([]);

  const [
    chickenLoading,
    setChickenLoading,
  ] = useState(false);

  const [
    chickenError,
    setChickenError,
  ] = useState("");


  // CHICKEN — ГОЛОДНА КУРКА
  // =========================================================

  const loadChicken =
    useCallback(
      async () => {

        if (
          !game?.id ||
          !currentUser?.id
        ) {
          setChickenSession(null);
          return;
        }


        const {
          data,
          error,
        } =
          await getActiveChicken(
            game.id
          );


        if (error) {

          console.error(
            "GET ACTIVE CHICKEN ERROR:",
            error
          );

          setChickenError(
            error.message
          );

          return;
        }


        if (data?.active) {
          setChickenSession(data);
        } else {
          setChickenSession(null);
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
      "chicken_select"
    ) {

      loadChicken();

      return;
    }


    setChickenSession(null);
    setChickenSelectedSlots([]);

  }, [
    game?.id,
    game?.phase,
    currentUser?.id,
    loadChicken,
  ]);


  const openChicken =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !canPlayTurn ||
        chickenLoading
      ) {
        return;
      }


      setChickenLoading(true);
      setChickenError("");
      setChickenSelectedSlots([]);


      const {
        data,
        error,
      } =
        await getHandCounts(
          game.id
        );


      if (error) {

        console.error(
          "CHICKEN HAND COUNTS ERROR:",
          error
        );

        setChickenError(
          error.message
        );

        setChickenLoading(false);

        return;
      }


      const targets =
        (data ?? [])
          .filter(
            item =>
              item.player_id !==
              currentUser.id &&
              Number(
                item.hand_count ?? 0
              ) >= 7
          );


      setChickenCardId(
        gameCardId
      );

      setChickenTargets(
        targets
      );

      setPreviewCard(null);
      setAlmsMenuOpen(false);


      if (
        targets.length === 0
      ) {
        setChickenError(
          "Немає суперника з 7 або більше картами в руці."
        );
      }


      setChickenLoading(false);
    };


  const closeChicken =
    () => {

      if (chickenLoading) {
        return;
      }

      setChickenCardId(null);
      setChickenTargets([]);
      setChickenSelectedSlots([]);
      setChickenError("");
    };


  const handleStartChicken =
    async targetPlayerId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !chickenCardId ||
        !targetPlayerId ||
        chickenLoading
      ) {
        return;
      }


      setChickenLoading(true);
      setChickenError("");


      const {
        result,
        error,
      } =
        await startChicken(
          game.id,
          chickenCardId,
          targetPlayerId
        );


      if (error) {

        console.error(
          "START CHICKEN ERROR:",
          error
        );

        setChickenError(
          error.message
        );

        setChickenLoading(false);

        return;
      }


      console.log(
        "CHICKEN STARTED:",
        result
      );


      setChickenSession(
        result
          ? {
            ...result,
            can_choose: true,
          }
          : null
      );

      setChickenCardId(null);
      setChickenTargets([]);
      setChickenSelectedSlots([]);

      setPreviewCard(null);
      setAlmsMenuOpen(false);


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();


      setChickenLoading(false);
    };


  const toggleChickenSlot =
    slotNo => {

      if (
        chickenLoading ||
        !chickenSession?.can_choose
      ) {
        return;
      }


      setChickenSelectedSlots(
        current => {

          if (
            current.includes(
              slotNo
            )
          ) {
            return current.filter(
              item =>
                item !== slotNo
            );
          }


          if (
            current.length >= 3
          ) {
            return current;
          }


          return [
            ...current,
            slotNo,
          ];
        }
      );
    };


  const handleResolveChicken =
    async () => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !chickenSession?.active ||
        !chickenSession?.can_choose ||
        chickenSelectedSlots.length !== 3 ||
        chickenLoading
      ) {
        return;
      }


      setChickenLoading(true);
      setChickenError("");


      const {
        result,
        error,
      } =
        await resolveChicken(
          game.id,
          chickenSelectedSlots
        );


      if (error) {

        console.error(
          "RESOLVE CHICKEN ERROR:",
          error
        );

        setChickenError(
          error.message
        );

        setChickenLoading(false);

        return;
      }


      console.log(
        "CHICKEN RESULT:",
        result
      );


      setChickenSession(null);
      setChickenSelectedSlots([]);
      setChickenCardId(null);
      setChickenTargets([]);


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();


      setChickenLoading(false);
    };


  // =========================================================

  return {
    chickenCardId,
    setChickenCardId,
    chickenTargets,
    setChickenTargets,
    chickenSession,
    setChickenSession,
    chickenSelectedSlots,
    setChickenSelectedSlots,
    chickenLoading,
    setChickenLoading,
    chickenError,
    setChickenError,
    loadChicken,
    openChicken,
    closeChicken,
    handleStartChicken,
    toggleChickenSlot,
    handleResolveChicken,
  };
};
