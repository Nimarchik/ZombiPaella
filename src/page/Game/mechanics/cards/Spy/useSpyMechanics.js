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

export const useSpyMechanics = (ctx) => {

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

  // SPY — ШПИГУН
  // =========================================================

  const [
    spyReveal,
    setSpyReveal,
  ] = useState(null);

  const [
    spyLoading,
    setSpyLoading,
  ] = useState(false);

  const [
    spyError,
    setSpyError,
  ] = useState("");

  const [
    spyPlayingCardId,
    setSpyPlayingCardId,
  ] = useState(null);


  const spyCard =
    useMemo(
      () =>
        hand.find(
          gameCard =>
            gameCard.card?.id ===
            "spy"
        ) ?? null,
      [hand]
    );


  const canPlaySpy =
    Boolean(
      activeBattle?.id &&
      iAmDefender &&
      game?.phase ===
      "battle_waiting_defense" &&
      spyCard?.id &&
      !spyReveal?.active
    );


  // SPY — PRIVATE ATTACK REVEAL BEFORE DEFENSE
  // =========================================================

  const loadSpyReveal =
    useCallback(
      async () => {

        if (
          !game?.id ||
          !currentUser?.id ||
          !activeBattle?.id ||
          !iAmDefender ||
          game?.phase !==
          "battle_waiting_defense"
        ) {
          setSpyReveal(null);
          return null;
        }


        const {
          data,
          error,
        } =
          await getActiveSpyReveal(
            game.id
          );


        if (error) {

          console.error(
            "GET SPY REVEAL ERROR:",
            error
          );

          setSpyError(
            error.message
          );

          return null;
        }


        const reveal =
          data?.active &&
            data?.battle_id ===
            activeBattle.id
            ? data
            : null;


        setSpyReveal(
          reveal
        );

        return reveal;
      },
      [
        game?.id,
        game?.phase,
        currentUser?.id,
        activeBattle?.id,
        iAmDefender,
      ]
    );


  useEffect(() => {

    setSpyError("");
    setSpyPlayingCardId(null);


    if (
      game?.phase ===
      "battle_waiting_defense" &&
      iAmDefender
    ) {
      loadSpyReveal();
    } else {
      setSpyReveal(null);
    }

  }, [
    activeBattle?.id,
    game?.phase,
    iAmDefender,
    loadSpyReveal,
  ]);


  const handlePlaySpy =
    async () => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !activeBattle?.id ||
        !spyCard?.id ||
        !canPlaySpy ||
        spyLoading
      ) {
        return;
      }


      setSpyLoading(true);
      setSpyPlayingCardId(
        spyCard.id
      );
      setSpyError("");


      const {
        result,
        error,
      } =
        await playSpy(
          game.id,
          activeBattle.id,
          spyCard.id
        );


      if (error) {

        console.error(
          "PLAY SPY ERROR:",
          error
        );

        setSpyError(
          error.message
        );

        setSpyLoading(false);
        setSpyPlayingCardId(null);

        return;
      }


      console.log(
        "SPY RESULT:",
        result
      );


      // Після Шпигуна захисник повинен прийняти рішення заново.
      setSelectedDefenseCardId(null);
      setDefenseSupportCardIds([]);


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
      } else {
        await loadSpyReveal();
      }


      setSpyLoading(false);
      setSpyPlayingCardId(null);
    };



  return {
    spyReveal,
    setSpyReveal,
    spyLoading,
    setSpyLoading,
    spyError,
    setSpyError,
    spyPlayingCardId,
    setSpyPlayingCardId,
    spyCard,
    canPlaySpy,
    loadSpyReveal,
    handlePlaySpy,
  };
};
