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

export const useReactionsMechanics = (ctx) => {

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

    loadTurnActionState: externalLoadTurnActionState,
    loadMyIngredientCount: externalLoadMyIngredientCount,
    loadFortresses: externalLoadFortresses,
    loadStatues: externalLoadStatues,
    loadBattleGuardChoice: externalLoadBattleGuardChoice,
    runtimeFns,

    batMechanics,
    troubleMechanics,
    battleGuardMechanics,
  } = ctx;

  // BATTLE REACTIONS — БАЛАЧКИ
  // =========================================================

  const [
    battleReaction,
    setBattleReaction,
  ] = useState(null);

  const [
    battleReactionLoading,
    setBattleReactionLoading,
  ] = useState(false);

  const [
    battleReactionError,
    setBattleReactionError,
  ] = useState("");


  // =========================================================
  // ENERGY REACTION — ЗАХИСТ / УЛЬТРАЗАХИСТ
  // =========================================================

  const [
    energyReaction,
    setEnergyReaction,
  ] = useState(null);

  const [
    energyReactionLoading,
    setEnergyReactionLoading,
  ] = useState(false);

  const [
    energyReactionError,
    setEnergyReactionError,
  ] = useState("");

  const [
    ultraprotectionDiscardIds,
    setUltraprotectionDiscardIds,
  ] = useState([]);



  // BATTLE REACTIONS — БАЛАЧКИ
  // =========================================================

  const loadBattleReaction =
    useCallback(
      async () => {

        if (
          !game?.id ||
          !currentUser?.id
        ) {
          setBattleReaction(null);
          return;
        }


        const {
          data,
          error,
        } =
          await getActiveBattleReaction(
            game.id
          );


        if (error) {

          console.error(
            "GET ACTIVE BATTLE REACTION ERROR:",
            error
          );

          setBattleReactionError(
            error.message
          );

          return;
        }


        setBattleReaction(
          data?.active
            ? data
            : null
        );

      },
      [
        game?.id,
        currentUser?.id,
      ]
    );


  const loadEnergyReaction =
    useCallback(
      async () => {

        if (
          !game?.id ||
          !currentUser?.id
        ) {
          setEnergyReaction(null);
          return;
        }


        const {
          data,
          error,
        } =
          await getActiveEnergyReaction(
            game.id
          );


        if (error) {

          console.error(
            "GET ACTIVE ENERGY REACTION ERROR:",
            error
          );

          setEnergyReactionError(
            error.message
          );

          return;
        }


        setEnergyReaction(
          data?.active
            ? data
            : null
        );


        if (!data?.active) {
          setUltraprotectionDiscardIds([]);
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
      "battle_guard_choice"
    ) {
      setBattleReaction(null);
      setEnergyReaction(null);
      setUltraprotectionDiscardIds([]);
      externalLoadBattleGuardChoice?.();
      return;
    }


    if (
      game?.phase ===
      "battle_reaction" ||
      game?.phase ===
      "battle_finalize"
    ) {

      setEnergyReaction(null);
      setUltraprotectionDiscardIds([]);

      loadBattleReaction();

      return;
    }


    if (
      game?.phase ===
      "energy_reaction"
    ) {

      setBattleReaction(null);

      loadEnergyReaction();

      return;
    }


    setBattleReaction(null);
    setEnergyReaction(null);
    battleGuardMechanics?.setBattleGuardChoice?.(null);
    setUltraprotectionDiscardIds([]);
    setBattleReactionError("");
    setEnergyReactionError("");
    battleGuardMechanics?.setBattleGuardChoiceError?.("");

  }, [
    game?.id,
    game?.phase,
    currentUser?.id,
    loadBattleReaction,
    externalLoadBattleGuardChoice,
  ]);


  useEffect(() => {

    setUltraprotectionDiscardIds([]);

  }, [
    energyReaction?.energy_card_id,
  ]);


  const handlePassBattleReaction =
    async () => {

      if (
        !battleReaction?.battle_id ||
        !battleReaction?.can_pass ||
        battleReactionLoading
      ) {
        return;
      }


      setBattleReactionLoading(true);
      setBattleReactionError("");


      const {
        result,
        error,
      } =
        await passBattleReaction(
          battleReaction.battle_id
        );


      if (error) {

        console.error(
          "PASS BATTLE REACTION ERROR:",
          error
        );

        setBattleReactionError(
          error.message
        );

        setBattleReactionLoading(false);

        return;
      }


      console.log(
        "BATTLE REACTION PASS:",
        result
      );


      await loadGameState();
      await loadBattleReaction();


      setBattleReactionLoading(false);
    };


  const handlePlayChatter =
    async () => {

      if (
        !battleReaction?.battle_id ||
        !battleReaction?.chatter_card_id ||
        !battleReaction?.can_play_chatter ||
        battleReactionLoading
      ) {
        return;
      }


      setBattleReactionLoading(true);
      setBattleReactionError("");


      const {
        result,
        error,
      } =
        await playChatter(
          battleReaction.battle_id,
          battleReaction.chatter_card_id
        );


      if (error) {

        console.error(
          "PLAY CHATTER ERROR:",
          error
        );

        setBattleReactionError(
          error.message
        );

        setBattleReactionLoading(false);

        return;
      }


      console.log(
        "CHATTER RESULT:",
        result
      );


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();


      if (
        result?.energy_reaction
      ) {
        await loadEnergyReaction();
      } else {
        await loadBattleReaction();
      }


      setBattleReactionLoading(false);
    };


  const handleFinalizeBattleReactions =
    useCallback(
      async () => {

        if (
          !battleReaction?.battle_id ||
          battleReaction?.defender_id !==
          currentUser?.id ||
          !battleReaction?.ready_to_finalize ||
          battleReactionLoading
        ) {
          return;
        }


        setBattleReactionLoading(true);
        setBattleReactionError("");


        const battleId =
          battleReaction.battle_id;


        const {
          result,
          error,
        } =
          await finalizeBattleReactions(
            battleId
          );


        if (error) {

          console.error(
            "FINALIZE BATTLE REACTIONS ERROR:",
            error
          );

          setBattleReactionError(
            error.message
          );

          setBattleReactionLoading(false);

          return;
        }


        console.log(
          "BATTLE FINALIZED:",
          result
        );


        setBattleReaction(null);
        setEnergyReaction(null);
        setUltraprotectionDiscardIds([]);

        setActiveBattle(null);


        await runtimeFns.loadBattleResult?.(battleId);

        await refreshCards(
          game.id,
          currentUser.id
        );

        await loadGameState();

        if (
          result?.guard_choice_pending
        ) {
          await externalLoadBattleGuardChoice?.();
        }


        setBattleReactionLoading(false);
      },
      [
        battleReaction,
        battleReactionLoading,
        currentUser?.id,
        game?.id,
        runtimeFns.loadBattleResult,
        loadGameState,
        externalLoadBattleGuardChoice,
        refreshCards,
        setActiveBattle,
      ]
    );


  useEffect(() => {

    if (
      game?.phase !==
      "battle_finalize" ||
      !battleReaction
        ?.ready_to_finalize ||
      battleReaction
        ?.defender_id !==
      currentUser?.id ||
      battleReactionLoading
    ) {
      return;
    }


    handleFinalizeBattleReactions();

  }, [
    game?.phase,
    battleReaction
      ?.ready_to_finalize,
    battleReaction
      ?.defender_id,
    currentUser?.id,
    battleReactionLoading,
    handleFinalizeBattleReactions,
  ]);


  // =========================================================
  // ENERGY REACTION — УЛЬТРАЗАХИСТ
  // =========================================================

  const ultraprotectionLockedIds =
    useMemo(
      () =>
        new Set(
          Array.isArray(
            energyReaction
              ?.locked_card_ids
          )
            ? energyReaction
              .locked_card_ids
            : []
        ),
      [
        energyReaction
          ?.locked_card_ids,
      ]
    );


  const ultraprotectionDiscardOptions =
    useMemo(
      () =>
        hand.filter(
          gameCard =>
            gameCard.id !==
            energyReaction
              ?.ultraprotection_card_id &&
            !ultraprotectionLockedIds
              .has(
                gameCard.id
              )
        ),
      [
        hand,
        energyReaction
          ?.ultraprotection_card_id,
        ultraprotectionLockedIds,
      ]
    );


  const toggleUltraprotectionDiscard =
    gameCardId => {

      if (
        energyReactionLoading ||
        !energyReaction?.can_play_ultraprotection
      ) {
        return;
      }


      const required =
        Number(
          energyReaction
            ?.required_discard_count ??
          0
        );


      setUltraprotectionDiscardIds(
        current => {

          if (
            current.includes(
              gameCardId
            )
          ) {
            return current.filter(
              id =>
                id !==
                gameCardId
            );
          }


          if (
            current.length >=
            required
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


  const handlePassEnergyReaction =
    async () => {

      if (
        !game?.id ||
        !energyReaction?.active ||
        !energyReaction?.can_pass ||
        energyReactionLoading
      ) {
        return;
      }


      setEnergyReactionLoading(true);
      setEnergyReactionError("");


      const {
        result,
        error,
      } =
        await passEnergyReaction(
          game.id
        );


      if (error) {

        console.error(
          "PASS ENERGY REACTION ERROR:",
          error
        );

        setEnergyReactionError(
          error.message
        );

        setEnergyReactionLoading(false);

        return;
      }


      console.log(
        "ENERGY REACTION PASS:",
        result
      );


      setUltraprotectionDiscardIds([]);


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();

      await loadEnergyReaction();
      await loadBattleReaction();
      await runtimeFns.loadSpyReveal?.();


      setEnergyReactionLoading(false);
    };


  const handlePlayProtection =
    async () => {

      if (
        !game?.id ||
        !energyReaction?.active ||
        !energyReaction?.can_play_protection ||
        !energyReaction?.protection_card_id ||
        energyReactionLoading
      ) {
        return;
      }


      setEnergyReactionLoading(true);
      setEnergyReactionError("");
      setUltraprotectionDiscardIds([]);


      const {
        result,
        error,
      } =
        await playProtection(
          game.id,
          energyReaction
            .protection_card_id
        );


      if (error) {

        console.error(
          "PLAY PROTECTION ERROR:",
          error
        );

        setEnergyReactionError(
          error.message
        );

        setEnergyReactionLoading(false);

        return;
      }


      console.log(
        "PROTECTION RESULT:",
        result
      );


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();

      await loadEnergyReaction();
      await loadBattleReaction();
      await runtimeFns.loadSpyReveal?.();


      setEnergyReactionLoading(false);
    };


  const handlePlayUltraprotection =
    async () => {

      if (
        !game?.id ||
        !energyReaction?.active ||
        !energyReaction?.can_play_ultraprotection ||
        !energyReaction
          ?.ultraprotection_card_id ||
        energyReactionLoading
      ) {
        return;
      }


      const required =
        Number(
          energyReaction
            ?.required_discard_count ??
          0
        );


      if (
        ultraprotectionDiscardIds
          .length !==
        required
      ) {
        return;
      }


      setEnergyReactionLoading(true);
      setEnergyReactionError("");


      const {
        result,
        error,
      } =
        await playUltraprotection(
          game.id,
          energyReaction
            .ultraprotection_card_id,
          ultraprotectionDiscardIds
        );


      if (error) {

        console.error(
          "PLAY ULTRAPROTECTION ERROR:",
          error
        );

        setEnergyReactionError(
          error.message
        );

        setEnergyReactionLoading(false);

        return;
      }


      console.log(
        "ULTRAPROTECTION RESULT:",
        result
      );


      setUltraprotectionDiscardIds([]);


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();

      await loadEnergyReaction();
      await loadBattleReaction();
      await runtimeFns.loadSpyReveal?.();


      setEnergyReactionLoading(false);
    };


  // =========================================================
  // REACTION REALTIME
  //
  // SQL навмисно робить UPDATE games навіть коли phase
  // лишається тим самим. Це дає всім клієнтам сигнал
  // оновити стан реакцій.
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
          `reactions-${gameId}-${currentUser.id}`
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

          async payload => {

            const phase =
              payload.new?.phase;


            if (
              phase ===
              "battle_guard_choice"
            ) {

              setBattleReaction(null);
              setEnergyReaction(null);
              runtimeFns.setSpyReveal?.(null);
              setUltraprotectionDiscardIds([]);

              await externalLoadBattleGuardChoice?.();

            } else if (
              phase ===
              "battle_reaction" ||
              phase ===
              "battle_finalize"
            ) {

              setEnergyReaction(null);
              battleGuardMechanics?.setBattleGuardChoice?.(null);
              setUltraprotectionDiscardIds([]);

              await loadBattleReaction();

            } else if (
              phase ===
              "energy_reaction"
            ) {

              setBattleReaction(null);
              battleGuardMechanics?.setBattleGuardChoice?.(null);
              runtimeFns.setSpyReveal?.(null);

              await loadEnergyReaction();

            } else if (
              phase ===
              "battle_waiting_defense"
            ) {

              setBattleReaction(null);
              setEnergyReaction(null);
              battleGuardMechanics?.setBattleGuardChoice?.(null);
              setUltraprotectionDiscardIds([]);

              await runtimeFns.loadSpyReveal?.();

            } else {

              setBattleReaction(null);
              setEnergyReaction(null);
              battleGuardMechanics?.setBattleGuardChoice?.(null);
              runtimeFns.setSpyReveal?.(null);
              setUltraprotectionDiscardIds([]);

            }


            await refreshCards(
              gameId,
              currentUser.id
            );

            await loadGameState();
            await externalLoadFortresses?.();
            await externalLoadStatues?.();
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
    loadBattleReaction,
    externalLoadBattleGuardChoice,
    runtimeFns.loadSpyReveal,
    refreshCards,
    loadGameState,
    externalLoadFortresses,
    externalLoadStatues,
  ]);


  // =========================================================

  return {
    battleReaction,
    setBattleReaction,
    battleReactionLoading,
    setBattleReactionLoading,
    battleReactionError,
    setBattleReactionError,
    energyReaction,
    setEnergyReaction,
    energyReactionLoading,
    setEnergyReactionLoading,
    energyReactionError,
    setEnergyReactionError,
    ultraprotectionDiscardIds,
    setUltraprotectionDiscardIds,
    loadBattleReaction,
    handlePassBattleReaction,
    handlePlayChatter,
    handleFinalizeBattleReactions,
    ultraprotectionDiscardOptions,
    toggleUltraprotectionDiscard,
    handlePassEnergyReaction,
    handlePlayProtection,
    handlePlayUltraprotection,
  };
};
