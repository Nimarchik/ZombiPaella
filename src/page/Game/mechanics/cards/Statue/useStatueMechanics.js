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

export const useStatueMechanics = (ctx) => {

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

  // STATUE — ВЕЛИЧЕЗНА СТАТУЯ
  // =========================================================

  const [
    activeStatues,
    setActiveStatues,
  ] = useState([]);

  const [
    statueLoading,
    setStatueLoading,
  ] = useState(false);

  const [
    statueError,
    setStatueError,
  ] = useState("");

  const [
    statuePlayingCardId,
    setStatuePlayingCardId,
  ] = useState(null);


  // STATUE — ВЕЛИЧЕЗНА СТАТУЯ
  // =========================================================

  const loadStatues =
    useCallback(
      async () => {

        if (
          !game?.id ||
          !currentUser?.id
        ) {
          setActiveStatues([]);
          return [];
        }

        const {
          data,
          error,
        } =
          await getActiveStatues(
            game.id
          );

        if (error) {
          console.error(
            "GET ACTIVE STATUES ERROR:",
            error
          );
          setStatueError(
            error.message
          );
          return [];
        }

        const statues =
          Array.isArray(data)
            ? data
            : [];

        setActiveStatues(
          statues
        );

        return statues;
      },
      [
        game?.id,
        currentUser?.id,
      ]
    );


  useEffect(() => {
    loadStatues();
  }, [
    loadStatues,
  ]);


  useEffect(() => {

    if (
      !game?.id ||
      !currentUser?.id
    ) {
      return;
    }

    const gameId =
      game.id;

    const channel =
      supabase
        .channel(
          `statue-sync-${gameId}-${currentUser.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "game_cards",
            filter:
              `game_id=eq.${gameId}`,
          },
          async payload => {

            const definitionId =
              payload.new?.definition_id ??
              payload.old?.definition_id;

            if (
              definitionId ===
              "statue"
            ) {
              await loadStatues();
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "games",
            filter:
              `id=eq.${gameId}`,
          },
          async () => {
            await loadStatues();
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };

  }, [
    game?.id,
    currentUser?.id,
    loadStatues,
  ]);


  const myStatue =
    useMemo(
      () =>
        activeStatues.find(
          statue =>
            statue.owner_id ===
            currentUser?.id
        ) ?? null,
      [
        activeStatues,
        currentUser?.id,
      ]
    );


  const handlePlayStatue =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !canPlayTurn ||
        statueLoading
      ) {
        return;
      }

      if (myStatue) {
        setStatueError(
          "У тебе вже є активна Величезна статуя."
        );
        return;
      }

      setStatueLoading(true);
      setStatuePlayingCardId(
        gameCardId
      );
      setStatueError("");

      const {
        result,
        error,
      } =
        await playStatue(
          game.id,
          gameCardId
        );

      if (error) {
        console.error(
          "PLAY STATUE ERROR:",
          error
        );
        setStatueError(
          error.message
        );
        setStatueLoading(false);
        setStatuePlayingCardId(null);
        return;
      }

      console.log(
        "STATUE RESULT:",
        result
      );

      setPreviewCard(null);
      setAlmsMenuOpen(false);

      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();
      await loadStatues();

      setStatueLoading(false);
      setStatuePlayingCardId(null);
    };


  // =========================================================

  return {
    activeStatues,
    setActiveStatues,
    statueLoading,
    setStatueLoading,
    statueError,
    setStatueError,
    statuePlayingCardId,
    setStatuePlayingCardId,
    myStatue,
    loadStatues,
    handlePlayStatue,
  };
};
