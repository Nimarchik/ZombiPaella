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

import {
  startBazaar,
  pickBazaarCard,
  getActiveBazaar,
} from "../../../services/bazaarService";

export const useBazaarMechanics = (ctx) => {

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

  // BAZAAR
  // =========================================================

  const [
    bazaar,
    setBazaar,
  ] = useState(null);

  const [
    bazaarLoading,
    setBazaarLoading,
  ] = useState(false);

  const [
    bazaarError,
    setBazaarError,
  ] = useState("");

  const [
    bazaarStartingCardId,
    setBazaarStartingCardId,
  ] = useState(null);


  // BAZAAR
  // =========================================================

  const loadBazaar =
    useCallback(
      async () => {

        if (
          !game?.id ||
          !currentUser?.id
        ) {
          setBazaar(null);
          return;
        }


        const {
          data,
          error,
        } =
          await getActiveBazaar(
            game.id
          );


        if (error) {

          console.error(
            "GET BAZAAR ERROR:",
            error
          );

          setBazaarError(
            error.message
          );

          return;
        }


        if (data?.active) {
          setBazaar(data);
        } else {
          setBazaar(null);
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
      "bazaar"
    ) {

      loadBazaar();

      return;
    }


    setBazaar(null);
    setBazaarError("");

  }, [
    game?.id,
    game?.phase,
    game?.current_player_id,
    currentUser?.id,
    loadBazaar,
  ]);


  const bazaarActive =
    Boolean(
      bazaar?.active
    );


  const iAmBazaarPicker =
    bazaarActive &&
    bazaar?.current_picker_id ===
    currentUser?.id;


  const bazaarCards =
    Array.isArray(
      bazaar?.cards
    )
      ? bazaar.cards
      : [];


  const handleStartBazaar =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !canPlayTurn ||
        bazaarLoading
      ) {
        return;
      }


      setBazaarLoading(true);
      setBazaarStartingCardId(
        gameCardId
      );
      setBazaarError("");


      const {
        result,
        error,
      } =
        await startBazaar(
          game.id,
          gameCardId
        );


      if (error) {

        console.error(
          "START BAZAAR ERROR:",
          error
        );

        setBazaarError(
          error.message
        );

        setBazaarLoading(false);
        setBazaarStartingCardId(null);

        return;
      }


      console.log(
        "BAZAAR STARTED:",
        result
      );


      setPreviewCard(null);
      setAlmsMenuOpen(false);


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();
      await loadBazaar();


      setBazaarLoading(false);
      setBazaarStartingCardId(null);
    };


  const handlePickBazaarCard =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !iAmBazaarPicker ||
        bazaarLoading
      ) {
        return;
      }


      setBazaarLoading(true);
      setBazaarError("");


      const {
        result,
        error,
      } =
        await pickBazaarCard(
          game.id,
          gameCardId
        );


      if (error) {

        console.error(
          "PICK BAZAAR ERROR:",
          error
        );

        setBazaarError(
          error.message
        );

        setBazaarLoading(false);

        return;
      }


      console.log(
        "BAZAAR PICK:",
        result
      );


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();
      await loadBazaar();


      setBazaarLoading(false);
    };


  // =========================================================

  return {
    bazaar,
    setBazaar,
    bazaarLoading,
    setBazaarLoading,
    bazaarError,
    setBazaarError,
    bazaarStartingCardId,
    setBazaarStartingCardId,
    bazaarActive,
    iAmBazaarPicker,
    bazaarCards,
    loadBazaar,
    handleStartBazaar,
    handlePickBazaarCard,
  };
};
