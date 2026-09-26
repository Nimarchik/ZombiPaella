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

export const useSilkTradeMechanics = (ctx) => {

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

  // SILK TRADE — ОБМІН ШОВКОМ
  // =========================================================

  const [
    silkTradeCardId,
    setSilkTradeCardId,
  ] = useState(null);

  const [
    silkTradeMyIds,
    setSilkTradeMyIds,
  ] = useState([]);

  const [
    silkTradeTargetIds,
    setSilkTradeTargetIds,
  ] = useState([]);

  const [
    silkTradeLoading,
    setSilkTradeLoading,
  ] = useState(false);

  const [
    silkTradeError,
    setSilkTradeError,
  ] = useState("");


  // SILK TRADE — ОБМІН ШОВКОМ
  // =========================================================

  const silkTradeOwnTreasures =
    useMemo(
      () =>
        treasures.filter(
          treasure =>
            treasure.owner_id ===
            currentUser?.id
        ),
      [
        treasures,
        currentUser?.id,
      ]
    );


  const silkTradeOpponentTreasures =
    useMemo(
      () =>
        treasures.filter(
          treasure =>
            treasure.owner_id &&
            treasure.owner_id !==
              currentUser?.id
        ),
      [
        treasures,
        currentUser?.id,
      ]
    );


  const openSilkTrade =
    gameCardId => {

      if (
        !gameCardId ||
        silkTradeLoading
      ) {
        return;
      }

      setSilkTradeCardId(
        gameCardId
      );

      setSilkTradeMyIds([]);
      setSilkTradeTargetIds([]);
      setSilkTradeError("");

      setPreviewCard(null);
      setAlmsMenuOpen(false);
    };


  const closeSilkTrade =
    () => {

      if (silkTradeLoading) {
        return;
      }

      setSilkTradeCardId(null);
      setSilkTradeMyIds([]);
      setSilkTradeTargetIds([]);
      setSilkTradeError("");
    };


  const toggleSilkTradeMyTreasure =
    gameCardId => {

      if (
        !gameCardId ||
        silkTradeLoading
      ) {
        return;
      }

      setSilkTradeMyIds(
        current => {

          if (
            current.includes(
              gameCardId
            )
          ) {
            return current.filter(
              id =>
                id !== gameCardId
            );
          }

          if (
            current.length >= 2
          ) {
            return current;
          }

          return [
            ...current,
            gameCardId,
          ];
        }
      );
    };


  const toggleSilkTradeTargetTreasure =
    gameCardId => {

      if (
        !gameCardId ||
        silkTradeLoading
      ) {
        return;
      }

      setSilkTradeTargetIds(
        current => {

          if (
            current.includes(
              gameCardId
            )
          ) {
            return current.filter(
              id =>
                id !== gameCardId
            );
          }

          if (
            current.length >= 2
          ) {
            return current;
          }

          return [
            ...current,
            gameCardId,
          ];
        }
      );
    };


  const handlePlaySilkTrade =
    async () => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !silkTradeCardId ||
        silkTradeLoading
      ) {
        return;
      }


      if (
        silkTradeMyIds.length !== 2 ||
        silkTradeTargetIds.length !== 2
      ) {

        setSilkTradeError(
          "Обери рівно 2 свої скарби та 2 скарби суперників."
        );

        return;
      }


      setSilkTradeLoading(true);
      setSilkTradeError("");


      const {
        result,
        error,
      } =
        await playSilkTrade(
          game.id,
          silkTradeCardId,
          silkTradeMyIds,
          silkTradeTargetIds
        );


      if (error) {

        console.error(
          "PLAY SILK TRADE ERROR:",
          error
        );

        setSilkTradeError(
          error.message
        );

        setSilkTradeLoading(false);

        return;
      }


      console.log(
        "SILK TRADE RESULT:",
        result
      );


      setSilkTradeCardId(null);
      setSilkTradeMyIds([]);
      setSilkTradeTargetIds([]);


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


      setSilkTradeLoading(false);
    };


  // =========================================================

  return {
    silkTradeCardId,
    setSilkTradeCardId,
    silkTradeMyIds,
    setSilkTradeMyIds,
    silkTradeTargetIds,
    setSilkTradeTargetIds,
    silkTradeLoading,
    setSilkTradeLoading,
    silkTradeError,
    setSilkTradeError,
    silkTradeOwnTreasures,
    silkTradeOpponentTreasures,
    openSilkTrade,
    closeSilkTrade,
    toggleSilkTradeMyTreasure,
    toggleSilkTradeTargetTreasure,
    handlePlaySilkTrade,
  };
};
