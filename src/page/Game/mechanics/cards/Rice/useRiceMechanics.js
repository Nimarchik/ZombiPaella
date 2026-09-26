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

export const useRiceMechanics = (ctx) => {

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

  // RICE — ХРУСТКИЙ РИС
  // =========================================================

  const [
    riceLoading,
    setRiceLoading,
  ] = useState(false);

  const [
    riceError,
    setRiceError,
  ] = useState("");

  const [
    ricePlayingCardId,
    setRicePlayingCardId,
  ] = useState(null);


  // RICE — ХРУСТКИЙ РИС
  // =========================================================

  const [
    myIngredientCount,
    setMyIngredientCount,
  ] = useState(0);


  const loadMyIngredientCount =
    useCallback(
      async () => {

        if (
          !game?.id ||
          !currentUser?.id
        ) {
          setMyIngredientCount(0);
          return 0;
        }


        const {
          count,
          error,
        } =
          await getEffectiveIngredientCount(
            game.id
          );


        if (error) {

          console.error(
            "GET EFFECTIVE INGREDIENT COUNT ERROR:",
            error
          );

          // Fallback to the old visual count so the UI
          // still stays usable if the RPC temporarily fails.
          const fallback =
            treasures.filter(
              treasure =>
                treasure.owner_id ===
                  currentUser.id &&
                Boolean(
                  treasure.card
                    ?.is_ingredient
                )
            ).length;

          setMyIngredientCount(
            fallback
          );

          return fallback;
        }


        const normalized =
          Number(count ?? 0);


        setMyIngredientCount(
          normalized
        );

        return normalized;
      },
      [
        game?.id,
        currentUser?.id,
        treasures,
      ]
    );


  useEffect(() => {
    loadMyIngredientCount();
  }, [
    loadMyIngredientCount,
  ]);


  const handlePlayRice =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !canPlayTurn ||
        riceLoading
      ) {
        return;
      }


      if (
        myIngredientCount < 4
      ) {

        setRiceError(
          `Потрібно щонайменше 4 інгредієнти. Зараз: ${myIngredientCount}.`
        );

        return;
      }


      setRiceLoading(true);
      setRicePlayingCardId(
        gameCardId
      );
      setRiceError("");


      const {
        result,
        error,
      } =
        await playRice(
          game.id,
          gameCardId
        );


      if (error) {

        console.error(
          "PLAY RICE ERROR:",
          error
        );

        setRiceError(
          error.message
        );

        setRiceLoading(false);
        setRicePlayingCardId(null);

        return;
      }


      console.log(
        "RICE RESULT:",
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


      if (
        result?.energy_reaction ||
        updatedGame?.phase ===
          "energy_reaction"
      ) {
        await loadEnergyReaction();
      }


      setRiceLoading(false);
      setRicePlayingCardId(null);
    };


  // =========================================================

  return {
    riceLoading,
    setRiceLoading,
    riceError,
    setRiceError,
    ricePlayingCardId,
    setRicePlayingCardId,
    myIngredientCount,
    setMyIngredientCount,
    loadMyIngredientCount,
    handlePlayRice,
  };
};
