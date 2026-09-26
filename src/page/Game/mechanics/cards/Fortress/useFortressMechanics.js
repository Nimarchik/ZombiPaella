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

export const useFortressMechanics = (ctx) => {

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

  // FORTRESS — ОБОРОННА ФОРТЕЦЯ
  // =========================================================

  const [
    activeFortresses,
    setActiveFortresses,
  ] = useState([]);

  const [
    fortressLoading,
    setFortressLoading,
  ] = useState(false);

  const [
    fortressError,
    setFortressError,
  ] = useState("");

  const [
    fortressPlayingCardId,
    setFortressPlayingCardId,
  ] = useState(null);


  // FORTRESS — ОБОРОННА ФОРТЕЦЯ
  // =========================================================

  const loadFortresses =
    useCallback(
      async () => {

        if (
          !game?.id ||
          !currentUser?.id
        ) {
          setActiveFortresses([]);
          return [];
        }


        const {
          data,
          error,
        } =
          await getActiveFortresses(
            game.id
          );


        if (error) {

          console.error(
            "GET ACTIVE FORTRESSES ERROR:",
            error
          );

          setFortressError(
            error.message
          );

          return [];
        }


        const fortresses =
          Array.isArray(data)
            ? data
            : [];


        setActiveFortresses(
          fortresses
        );

        return fortresses;
      },
      [
        game?.id,
        currentUser?.id,
      ]
    );


  useEffect(() => {

    loadFortresses();

  }, [
    loadFortresses,
  ]);


  // =========================================================
  // FORTRESS REALTIME SYNC
  //
  // Game.jsx already listens to game_cards for regular cards,
  // but active Fortresses live in their own state here.
  // Refresh this public state for EVERY player whenever a
  // Fortress card changes zone.
  // =========================================================

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
          `fortress-sync-${gameId}-${currentUser.id}`
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
              "fortress"
            ) {
              await loadFortresses();
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
            // Fallback signal. play_fortress() intentionally
            // updates games even though the turn stays the same.
            await loadFortresses();
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
    loadFortresses,
  ]);


  const myFortress =
    useMemo(
      () =>
        activeFortresses.find(
          fortress =>
            fortress.owner_id ===
            currentUser?.id
        ) ?? null,
      [
        activeFortresses,
        currentUser?.id,
      ]
    );


  const hasActiveFortress =
    useCallback(
      ownerId =>
        Boolean(
          ownerId &&
          activeFortresses.some(
            fortress =>
              fortress.owner_id ===
              ownerId
          )
        ),
      [activeFortresses]
    );


  const handlePlayFortress =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !canPlayTurn ||
        fortressLoading
      ) {
        return;
      }


      if (myFortress) {
        setFortressError(
          "У тебе вже є активна Оборонна фортеця."
        );
        return;
      }


      setFortressLoading(true);
      setFortressPlayingCardId(
        gameCardId
      );
      setFortressError("");


      const {
        result,
        error,
      } =
        await playFortress(
          game.id,
          gameCardId
        );


      if (error) {

        console.error(
          "PLAY FORTRESS ERROR:",
          error
        );

        setFortressError(
          error.message
        );

        setFortressLoading(false);
        setFortressPlayingCardId(null);

        return;
      }


      console.log(
        "FORTRESS RESULT:",
        result
      );


      setPreviewCard(null);
      setAlmsMenuOpen(false);


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();
      await loadFortresses();


      setFortressLoading(false);
      setFortressPlayingCardId(null);
    };


  // =========================================================

  return {
    activeFortresses,
    setActiveFortresses,
    fortressLoading,
    setFortressLoading,
    fortressError,
    setFortressError,
    fortressPlayingCardId,
    setFortressPlayingCardId,
    myFortress,
    hasActiveFortress,
    loadFortresses,
    handlePlayFortress,
  };
};
