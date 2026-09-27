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
  playMajorFlood
} from "../../services/gameService";

import {
  supabase,
} from "../../services/supabase";

import {
  startBazaar,
  pickBazaarCard,
  getActiveBazaar,
} from "./services/bazaarService";



export const useGameMechanics = ({
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
}) => {


  // =========================================================
  // PUBLIC SPECIAL CARD EVENT
  // =========================================================

  const [
    specialEvent,
    setSpecialEvent,
  ] = useState(null);

  const closeSpecialEvent =
    useCallback(() => {
      setSpecialEvent(null);
    }, []);

  // =========================================================
  // BATTLE STATE
  // =========================================================

  const [
    attackCardId,
    setAttackCardId,
  ] = useState(null);

  // "normal" | "group_open"
  // group_open = особлива відкрита атака карти "Гурт" (⚔ 5)
  const [
    attackMode,
    setAttackMode,
  ] = useState("normal");

  const [
    selectingTreasure,
    setSelectingTreasure,
  ] = useState(false);

  const [
    battleLoading,
    setBattleLoading,
  ] = useState(false);

  const [
    battleError,
    setBattleError,
  ] = useState("");

  const [
    draggedBattleCardId,
    setDraggedBattleCardId,
  ] = useState(null);

  const [
    hoveredTreasureId,
    setHoveredTreasureId,
  ] = useState(null);

  const [
    selectedTarget,
    setSelectedTarget,
  ] = useState(null);

  const [
    battleResult,
    setBattleResult,
  ] = useState(null);

  const [
    battleCardsRevealed,
    setBattleCardsRevealed,
  ] = useState(false);

  // Відкрита карта атаки Гуртом, яку захисник бачить ДО вибору захисту.
  // Support-карти при цьому залишаються прихованими.
  const [
    openAttackCard,
    setOpenAttackCard,
  ] = useState(null);


  // =========================================================
  // PRINCESS — EXTRA TREASURE
  // =========================================================

  const [
    bonusTreasureLoading,
    setBonusTreasureLoading,
  ] = useState(false);

  const [
    bonusTreasureError,
    setBonusTreasureError,
  ] = useState("");


  // =========================================================
  // SUPPORT CARDS
  // =========================================================

  const [
    attackSupportCardIds,
    setAttackSupportCardIds,
  ] = useState([]);

  const [
    selectedDefenseCardId,
    setSelectedDefenseCardId,
  ] = useState(null);

  const [
    defenseSupportCardIds,
    setDefenseSupportCardIds,
  ] = useState([]);


  // =========================================================
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


  // =========================================================
  // BAT
  // =========================================================

  const [
    batCardId,
    setBatCardId,
  ] = useState(null);

  const [
    batSelectingTreasure,
    setBatSelectingTreasure,
  ] = useState(false);

  const [
    batTarget,
    setBatTarget,
  ] = useState(null);

  const [
    batLoading,
    setBatLoading,
  ] = useState(false);

  const [
    batError,
    setBatError,
  ] = useState("");

  // =========================================================
  // VILENCIA — МІСЯЦЬ НАД ВАЛЕНСІЄЮ
  // =========================================================

  const [
    vilenciaLoading,
    setVilenciaLoading,
  ] = useState(false);

  const [
    vilenciaError,
    setVilenciaError,
  ] = useState("");

  const [
    vilenciaPlayingCardId,
    setVilenciaPlayingCardId,
  ] = useState(null);


  // =========================================================
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


  // =========================================================
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


  // =========================================================
  // ELIXIR — ДУХОВНИЙ ЕЛІКСИР
  // =========================================================

  const [
    elixirCardId,
    setElixirCardId,
  ] = useState(null);

  const [
    elixirOptions,
    setElixirOptions,
  ] = useState([]);

  const [
    elixirSelectedCardId,
    setElixirSelectedCardId,
  ] = useState(null);

  const [
    elixirLoading,
    setElixirLoading,
  ] = useState(false);

  const [
    elixirError,
    setElixirError,
  ] = useState("");


  // =========================================================
  // TEMPORARY TREASURES
  // =========================================================

  const [
    temporaryTreasureLoading,
    setTemporaryTreasureLoading,
  ] = useState(false);

  const [
    temporaryTreasureError,
    setTemporaryTreasureError,
  ] = useState("");

  const [
    temporaryTreasurePlayingCardId,
    setTemporaryTreasurePlayingCardId,
  ] = useState(null);


  const myTemporaryTreasureIds =
    useMemo(
      () =>
        treasures
          .filter(
            treasure =>
              treasure.owner_id ===
              currentUser?.id &&
              treasure.card?.type ===
              "treasure" &&
              treasure.card?.subtype ===
              "temporary"
          )
          .map(
            treasure =>
              treasure.id
          ),
      [
        treasures,
        currentUser?.id,
      ]
    );


  const handlePlayTemporaryTreasure =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !canPlayTurn ||
        temporaryTreasureLoading
      ) {
        return;
      }


      if (
        !myTemporaryTreasureIds
          .includes(gameCardId)
      ) {
        setTemporaryTreasureError(
          "Цей тимчасовий скарб не належить тобі."
        );
        return;
      }


      setTemporaryTreasureLoading(true);
      setTemporaryTreasurePlayingCardId(
        gameCardId
      );
      setTemporaryTreasureError("");


      const {
        result,
        error,
      } =
        await playTemporaryTreasure(
          game.id,
          gameCardId
        );


      if (error) {

        console.error(
          "USE TEMPORARY TREASURE ERROR:",
          error
        );

        setTemporaryTreasureError(
          error.message
        );

        setTemporaryTreasureLoading(false);
        setTemporaryTreasurePlayingCardId(
          null
        );

        return;
      }


      console.log(
        "TEMPORARY TREASURE RESULT:",
        result
      );


      setPreviewCard(null);
      setAlmsMenuOpen(false);


      await refreshCards(
        game.id,
        currentUser.id
      );


      await loadGameState();
      await loadTurnActionState();
      await loadMyIngredientCount();


      setTemporaryTreasureLoading(false);
      setTemporaryTreasurePlayingCardId(
        null
      );
    };


  // =========================================================
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

  // =========================================================
  // MAJOR FLOOD — ВЕЛИКА ПОВІНЬ
  // =========================================================

  const [
    majorFloodLoading,
    setMajorFloodLoading,
  ] = useState(false);

  const [
    majorFloodError,
    setMajorFloodError,
  ] = useState("");

  const [
    majorFloodPlayingCardId,
    setMajorFloodPlayingCardId,
  ] = useState(null);


  // =========================================================
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


  // =========================================================
  // SQUIB — ПЕТАРДА
  // =========================================================

  const [
    squibLoading,
    setSquibLoading,
  ] = useState(false);

  const [
    squibError,
    setSquibError,
  ] = useState("");

  const [
    squibPlayingCardId,
    setSquibPlayingCardId,
  ] = useState(null);


  // =========================================================
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


  // =========================================================
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


  // =========================================================
  // TROUBLE — КРИВАВА БИТВА
  // =========================================================

  const [
    troubleCardId,
    setTroubleCardId,
  ] = useState(null);

  const [
    troubleLoading,
    setTroubleLoading,
  ] = useState(false);

  const [
    troubleError,
    setTroubleError,
  ] = useState("");


  // =========================================================
  // PACT WITH DEVIL — УГОДА З ДИЯВОЛОМ
  // =========================================================

  const [
    pactCardId,
    setPactCardId,
  ] = useState(null);

  const [
    pactTargets,
    setPactTargets,
  ] = useState([]);

  const [
    pactTargetPlayerId,
    setPactTargetPlayerId,
  ] = useState(null);

  const [
    pactLoading,
    setPactLoading,
  ] = useState(false);

  const [
    pactError,
    setPactError,
  ] = useState("");


  // =========================================================
  // TRADING WINDS — ТОРГОВЕЛЬНІ ВІТРИ
  // =========================================================

  const [
    windsCardId,
    setWindsCardId,
  ] = useState(null);

  const [
    windsMyTreasureId,
    setWindsMyTreasureId,
  ] = useState(null);

  const [
    windsTargetTreasureId,
    setWindsTargetTreasureId,
  ] = useState(null);

  const [
    windsLoading,
    setWindsLoading,
  ] = useState(false);

  const [
    windsError,
    setWindsError,
  ] = useState("");


  // =========================================================
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


  // =========================================================
  // DOUBLE ACTION — ПОДВІЙНІ НЕПРИЄМНОСТІ
  // =========================================================

  const [
    turnActionState,
    setTurnActionState,
  ] = useState(null);

  const [
    doubleActionLoading,
    setDoubleActionLoading,
  ] = useState(false);

  const [
    doubleActionError,
    setDoubleActionError,
  ] = useState("");

  const [
    doubleActionPlayingCardId,
    setDoubleActionPlayingCardId,
  ] = useState(null);


  // =========================================================
  // BATTLE GUARD CHOICE
  // =========================================================

  const [
    battleGuardChoice,
    setBattleGuardChoice,
  ] = useState(null);

  const [
    battleGuardChoiceLoading,
    setBattleGuardChoiceLoading,
  ] = useState(false);

  const [
    battleGuardChoiceError,
    setBattleGuardChoiceError,
  ] = useState("");


  // =========================================================
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


  // =========================================================
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

  useEffect(() => {

    if (!specialEvent?.id) {
      return;
    }

    const timer =
      setTimeout(() => {
        setSpecialEvent(null);
      }, 15000);

    return () =>
      clearTimeout(timer);

  }, [
    specialEvent?.id,
    specialEvent?.event_type,
  ]);


  // =========================================================
  // PUBLIC SPECIAL EVENTS REALTIME
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
          `special-events-${gameId}-${currentUser.id}`
        )

        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "game_special_events",
            filter:
              `game_id=eq.${gameId}`,
          },

          payload => {

            console.log(
              "SPECIAL EVENT INSERT:",
              payload.new
            );

            setSpecialEvent(
              payload.new ?? null
            );
          }
        )

        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "game_special_events",
            filter:
              `game_id=eq.${gameId}`,
          },

          payload => {

            console.log(
              "SPECIAL EVENT UPDATE:",
              payload.new
            );

            setSpecialEvent(
              payload.new ?? null
            );
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
  ]);


  // =========================================================
  // BATTLE RESULT REVEAL
  // =========================================================

  useEffect(() => {

    if (!battleResult) {
      setBattleCardsRevealed(false);
      return;
    }

    setBattleCardsRevealed(false);

    const timer =
      setTimeout(() => {
        setBattleCardsRevealed(true);
      }, 700);

    return () =>
      clearTimeout(timer);

  }, [
    battleResult?.battle_id,
  ]);


  // =========================================================
  // CARD HELPERS
  // =========================================================

  const isDynamicBattleCard =
    card =>
      card?.effect_key ===
      "DYNAMIC_OPPONENT_TREASURE_COUNT";


  const isAttackSupportCard =
    card =>
      card?.id === "monleonetes" ||
      card?.id === "muixeranga" ||
      card?.effect_key ===
      "SUPPORT_ATTACK_PLUS_1" ||
      card?.effect_key ===
      "SUPPORT_ATTACK_PLUS_1_DEFENSE_PLUS_2";


  const isDefenseSupportCard =
    card =>
      card?.id === "muixeranga" ||
      card?.effect_key ===
      "SUPPORT_ATTACK_PLUS_1_DEFENSE_PLUS_2";


  const getAttackSupportValue =
    card => {

      if (
        card?.id === "monleonetes" ||
        card?.effect_key ===
        "SUPPORT_ATTACK_PLUS_1"
      ) {
        return 1;
      }

      if (
        card?.id === "muixeranga" ||
        card?.effect_key ===
        "SUPPORT_ATTACK_PLUS_1_DEFENSE_PLUS_2"
      ) {
        return 1;
      }

      return 0;
    };


  const getDefenseSupportValue =
    card => {

      if (
        card?.id === "muixeranga" ||
        card?.effect_key ===
        "SUPPORT_ATTACK_PLUS_1_DEFENSE_PLUS_2"
      ) {
        return 2;
      }

      return 0;
    };


  const canAttackWithBattleCard =
    card =>
      card?.type === "battle" &&
      !isAttackSupportCard(card) &&
      (
        (
          card?.attack !== null &&
          card?.attack !== undefined
        ) ||
        isDynamicBattleCard(card)
      );


  const canDefendWithBattleCard =
    card =>
      card?.type === "battle" &&
      !isAttackSupportCard(card) &&
      (
        (
          card?.defense !== null &&
          card?.defense !== undefined
        ) ||
        isDynamicBattleCard(card)
      );


  // =========================================================
  // COMPUTED BATTLE VALUES
  // =========================================================

  const iAmDefender =
    activeBattle?.defender_id ===
    currentUser?.id;


  const iAmAttacker =
    activeBattle?.attacker_id ===
    currentUser?.id;


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


  const squibCard =
    useMemo(
      () =>
        hand.find(
          gameCard =>
            gameCard.card?.id ===
            "squib"
        ) ?? null,
      [hand]
    );

  const protectionHandCard =
    useMemo(
      () =>
        hand.find(
          gameCard =>
            gameCard.id ===
            energyReaction
              ?.protection_card_id
        ) ?? null,
      [
        hand,
        energyReaction
          ?.protection_card_id,
      ]
    );


  const ultraprotectionHandCard =
    useMemo(
      () =>
        hand.find(
          gameCard =>
            gameCard.id ===
            energyReaction
              ?.ultraprotection_card_id
        ) ?? null,
      [
        hand,
        energyReaction
          ?.ultraprotection_card_id,
      ]
    );


  const canPlaySquib =
    Boolean(
      activeBattle?.id &&
      iAmAttacker &&
      game?.phase ===
      "battle_attacker_reaction" &&
      squibCard?.id
    );


  // =========================================================
  // GROUP / ГУРТ — SHOW OPEN ATTACK CARD TO DEFENDER
  // =========================================================

  useEffect(() => {

    let cancelled = false;


    const loadOpenAttackCard =
      async () => {

        setOpenAttackCard(null);


        if (
          !activeBattle?.id ||
          !iAmDefender
        ) {
          return;
        }


        const {
          data,
          error,
        } = await supabase.rpc(
          "get_open_group_attack_card",
          {
            p_battle_id:
              activeBattle.id,
          }
        );


        if (error) {

          console.error(
            "OPEN GROUP CARD ERROR:",
            error
          );

          return;
        }


        if (!cancelled) {
          setOpenAttackCard(
            data ?? null
          );
        }
      };


    loadOpenAttackCard();


    return () => {
      cancelled = true;
    };

  }, [
    activeBattle?.id,
    iAmDefender,
  ]);


  // =========================================================
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


  // =========================================================
  // SQUIB — ПЕТАРДА BEFORE DEFENSE
  // =========================================================

  const handlePlaySquib =
    async () => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !activeBattle?.id ||
        !squibCard?.id ||
        !canPlaySquib ||
        squibLoading
      ) {
        return;
      }


      setSquibLoading(true);
      setSquibPlayingCardId(
        squibCard.id
      );
      setSquibError("");


      const {
        result,
        error,
      } =
        await playSquib(
          game.id,
          activeBattle.id,
          squibCard.id
        );


      if (error) {

        console.error(
          "PLAY SQUIB ERROR:",
          error
        );

        setSquibError(
          error.message
        );

        setSquibLoading(false);
        setSquibPlayingCardId(null);

        return;
      }


      console.log(
        "SQUIB RESULT:",
        result
      );


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


      setSquibLoading(false);
      setSquibPlayingCardId(null);
    };


  const handlePassSquib =
    async () => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !activeBattle?.id ||
        !iAmAttacker ||
        game?.phase !==
        "battle_attacker_reaction" ||
        squibLoading
      ) {
        return;
      }


      setSquibLoading(true);
      setSquibError("");


      const {
        result,
        error,
      } =
        await passSquib(
          game.id,
          activeBattle.id
        );


      if (error) {

        console.error(
          "PASS SQUIB ERROR:",
          error
        );

        setSquibError(
          error.message
        );

        setSquibLoading(false);

        return;
      }


      console.log(
        "SQUIB PASS RESULT:",
        result
      );


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();


      setSquibLoading(false);
      setSquibPlayingCardId(null);
    };


  // =========================================================
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
  // TROUBLE — КРИВАВА БИТВА
  // =========================================================

  const myTreasureCount =
    useMemo(
      () =>
        treasures.filter(
          treasure =>
            treasure.owner_id ===
            currentUser?.id
        ).length,
      [
        treasures,
        currentUser?.id,
      ]
    );


  const troubleAttackCards =
    useMemo(
      () =>
        hand.filter(
          gameCard =>
            gameCard.id !==
            troubleCardId &&
            canAttackWithBattleCard(
              gameCard.card
            )
        ),
      [
        hand,
        troubleCardId,
      ]
    );


  const openTrouble =
    gameCardId => {

      if (
        !gameCardId ||
        troubleLoading
      ) {
        return;
      }

      setTroubleCardId(
        gameCardId
      );

      setTroubleError("");
      setBattleError("");

      setAttackCardId(null);
      setAttackMode("normal");
      setAttackSupportCardIds([]);
      setSelectingTreasure(false);
      setDraggedBattleCardId(null);
      setHoveredTreasureId(null);
      setSelectedTarget(null);

      setBatCardId(null);
      setBatTarget(null);
      setBatSelectingTreasure(false);

      setPreviewCard(null);
      setAlmsMenuOpen(false);
    };


  const closeTrouble =
    () => {

      if (
        troubleLoading ||
        battleLoading
      ) {
        return;
      }

      setTroubleCardId(null);
      setTroubleError("");

      setSelectingTreasure(false);
      setAttackCardId(null);
      setAttackMode("normal");
      setAttackSupportCardIds([]);
      setDraggedBattleCardId(null);
      setHoveredTreasureId(null);
      setSelectedTarget(null);
      setBattleError("");
    };


  const beginTroubleAttack =
    gameCardId => {

      if (
        !troubleCardId ||
        !gameCardId ||
        troubleLoading
      ) {
        return;
      }

      setAttackCardId(
        gameCardId
      );

      setAttackMode(
        "trouble"
      );

      setAttackSupportCardIds([]);
      setSelectingTreasure(true);
      setSelectedTarget(null);
      setBattleError("");
      setTroubleError("");
    };


  // =========================================================
  // PACT WITH DEVIL — УГОДА З ДИЯВОЛОМ
  // =========================================================

  const openPactDevil =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        pactLoading
      ) {
        return;
      }


      if (myTreasureCount <= 0) {

        setPactError(
          "Для «Угоди з дияволом» у тебе має бути хоча б 1 скарб."
        );

        return;
      }


      setPactLoading(true);
      setPactError("");
      setPactTargetPlayerId(null);


      const {
        data,
        error,
      } =
        await getHandCounts(
          game.id
        );


      if (error) {

        console.error(
          "PACT TARGETS ERROR:",
          error
        );

        setPactError(
          error.message
        );

        setPactLoading(false);

        return;
      }


      const targets =
        (data ?? [])
          .filter(
            item =>
              item.player_id !==
              currentUser.id
          )
          .map(
            item => ({
              ...item,
              treasure_count:
                treasures.filter(
                  treasure =>
                    treasure.owner_id ===
                    item.player_id
                ).length,
            })
          );


      setPactTargets(
        targets
      );

      setPactCardId(
        gameCardId
      );

      setPreviewCard(null);
      setAlmsMenuOpen(false);


      if (targets.length === 0) {

        setPactError(
          "Немає іншого гравця для обміну."
        );

      }


      setPactLoading(false);
    };


  const closePactDevil =
    () => {

      if (pactLoading) {
        return;
      }

      setPactCardId(null);
      setPactTargets([]);
      setPactTargetPlayerId(null);
      setPactError("");
    };


  const handlePlayPactDevil =
    async () => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !pactCardId ||
        !pactTargetPlayerId ||
        pactLoading
      ) {
        return;
      }


      if (myTreasureCount <= 0) {

        setPactError(
          "У тебе більше немає скарбів. Цю карту не можна зіграти."
        );

        return;
      }


      setPactLoading(true);
      setPactError("");


      const {
        result,
        error,
      } =
        await playPactDevil(
          game.id,
          pactCardId,
          pactTargetPlayerId
        );


      if (error) {

        console.error(
          "PLAY PACT DEVIL ERROR:",
          error
        );

        setPactError(
          error.message
        );

        setPactLoading(false);

        return;
      }


      console.log(
        "PACT DEVIL RESULT:",
        result
      );


      setPactCardId(null);
      setPactTargets([]);
      setPactTargetPlayerId(null);


      await refreshCards(
        game.id,
        currentUser.id
      );


      const updatedGame =
        await loadGameState();


      await loadTurnActionState();


      if (
        result?.energy_reaction ||
        updatedGame?.phase ===
        "energy_reaction"
      ) {
        await loadEnergyReaction();
      }


      setPactLoading(false);
    };


  // =========================================================
  // TRADING WINDS — ТОРГОВЕЛЬНІ ВІТРИ
  // =========================================================

  const windsOwnTreasures =
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


  const windsOpponentTreasures =
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


  const openWinds =
    gameCardId => {

      if (
        !gameCardId ||
        windsLoading
      ) {
        return;
      }

      setWindsCardId(gameCardId);
      setWindsMyTreasureId(null);
      setWindsTargetTreasureId(null);
      setWindsError("");

      setPreviewCard(null);
      setAlmsMenuOpen(false);
    };


  const closeWinds =
    () => {

      if (windsLoading) {
        return;
      }

      setWindsCardId(null);
      setWindsMyTreasureId(null);
      setWindsTargetTreasureId(null);
      setWindsError("");
    };


  const handlePlayWinds =
    async () => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !windsCardId ||
        windsLoading
      ) {
        return;
      }


      if (
        !windsMyTreasureId ||
        !windsTargetTreasureId
      ) {

        setWindsError(
          "Обери 1 свій скарб та 1 скарб іншого гравця."
        );

        return;
      }


      setWindsLoading(true);
      setWindsError("");


      const {
        result,
        error,
      } =
        await playWinds(
          game.id,
          windsCardId,
          windsMyTreasureId,
          windsTargetTreasureId
        );


      if (error) {

        console.error(
          "PLAY WINDS ERROR:",
          error
        );

        setWindsError(
          error.message
        );

        setWindsLoading(false);

        return;
      }


      console.log(
        "WINDS RESULT:",
        result
      );


      setWindsCardId(null);
      setWindsMyTreasureId(null);
      setWindsTargetTreasureId(null);


      await refreshCards(
        game.id,
        currentUser.id
      );


      const updatedGame =
        await loadGameState();


      await loadTurnActionState();


      if (
        result?.energy_reaction ||
        updatedGame?.phase ===
        "energy_reaction"
      ) {
        await loadEnergyReaction();
      }


      setWindsLoading(false);
    };


  // =========================================================
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
  // DOUBLE ACTION — ПОДВІЙНІ НЕПРИЄМНОСТІ
  // =========================================================

  const loadTurnActionState =
    useCallback(
      async () => {

        if (
          !game?.id ||
          !currentUser?.id
        ) {
          setTurnActionState(null);
          return null;
        }


        const {
          data,
          error,
        } =
          await getTurnActionState(
            game.id
          );


        if (error) {

          console.error(
            "GET TURN ACTION STATE ERROR:",
            error
          );

          return null;
        }


        setTurnActionState(
          data ?? null
        );

        return data ?? null;
      },
      [
        game?.id,
        currentUser?.id,
      ]
    );


  // Reload on every refreshed game object. This is important because
  // during a Double Action chain current_player_id may stay unchanged
  // while actions_remaining goes 2 -> 1.
  useEffect(() => {
    loadTurnActionState();
  }, [
    game,
    loadTurnActionState,
  ]);


  const handlePlayDoubleAction =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !canPlayTurn ||
        doubleActionLoading
      ) {
        return;
      }


      setDoubleActionLoading(true);
      setDoubleActionPlayingCardId(
        gameCardId
      );
      setDoubleActionError("");


      const {
        result,
        error,
      } =
        await playDoubleAction(
          game.id,
          gameCardId
        );


      if (error) {

        console.error(
          "PLAY DOUBLE ACTION ERROR:",
          error
        );

        setDoubleActionError(
          error.message
        );

        setDoubleActionLoading(false);
        setDoubleActionPlayingCardId(null);

        return;
      }


      console.log(
        "DOUBLE ACTION RESULT:",
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


      await loadTurnActionState();


      if (
        result?.energy_reaction ||
        updatedGame?.phase ===
        "energy_reaction"
      ) {
        await loadEnergyReaction();
      }


      setDoubleActionLoading(false);
      setDoubleActionPlayingCardId(null);
    };


  const bonusTreasurePending =
    Boolean(
      battleResult
        ?.bonus_treasure_pending
    );


  const iChooseBonusTreasure =
    bonusTreasurePending &&
    battleResult?.attacker_id ===
    currentUser?.id;


  const bonusTreasureOptions =
    useMemo(() => {

      if (
        !bonusTreasurePending ||
        !battleResult?.defender_id
      ) {
        return [];
      }

      return treasures.filter(
        treasure =>
          treasure.owner_id ===
          battleResult.defender_id
      );

    }, [
      treasures,
      bonusTreasurePending,
      battleResult?.defender_id,
    ]);


  const attackSupportCards =
    useMemo(() => {

      return hand.filter(
        gameCard =>
          gameCard.id !==
          attackCardId &&
          isAttackSupportCard(
            gameCard.card
          )
      );

    }, [
      hand,
      attackCardId,
    ]);


  const defenseSupportCards =
    useMemo(() => {

      return hand.filter(
        gameCard =>
          gameCard.id !==
          selectedDefenseCardId &&
          isDefenseSupportCard(
            gameCard.card
          )
      );

    }, [
      hand,
      selectedDefenseCardId,
    ]);


  const attackSupportBonus =
    useMemo(() => {

      return hand
        .filter(
          gameCard =>
            attackSupportCardIds
              .includes(
                gameCard.id
              )
        )
        .reduce(
          (
            total,
            gameCard
          ) =>
            total +
            getAttackSupportValue(
              gameCard.card
            ),
          0
        );

    }, [
      hand,
      attackSupportCardIds,
    ]);


  const defenseSupportBonus =
    useMemo(() => {

      return hand
        .filter(
          gameCard =>
            defenseSupportCardIds
              .includes(
                gameCard.id
              )
        )
        .reduce(
          (
            total,
            gameCard
          ) =>
            total +
            getDefenseSupportValue(
              gameCard.card
            ),
          0
        );

    }, [
      hand,
      defenseSupportCardIds,
    ]);


  const defenseCards =
    useMemo(() => {

      return hand.filter(
        gameCard =>
          canDefendWithBattleCard(
            gameCard.card
          )
      );

    }, [
      hand,
    ]);


  // =========================================================
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
  // RESET DEFENSE WHEN BATTLE CHANGES
  // =========================================================

  useEffect(() => {

    setSelectedDefenseCardId(null);
    setDefenseSupportCardIds([]);

  }, [
    activeBattle?.id,
  ]);


  // =========================================================
  // LOAD RESOLVED BATTLE
  // =========================================================

  const loadBattleResult =
    useCallback(
      async battleId => {

        const [
          detailsResponse,
          stateResponse,
        ] = await Promise.all([

          getBattleResultDetails(
            battleId
          ),

          supabase
            .from("game_battles")
            .select(`
              id,
              attacker_id,
              defender_id,
              status,
              bonus_treasure_pending,
              bonus_treasure_id,
              fortress_destroyed,
              fortress_card_id,
              statue_destroyed,
              statue_card_id,
              guard_choice_pending,
              guard_card_ids,
              guard_destroyed_card_id,
              guard_destroyed_definition_id,
              trouble_card_id,
              trouble_transfer_count,
              trouble_transfer_from_id,
              trouble_transfer_to_id,
              treasure_stolen
            `)
            .eq(
              "id",
              battleId
            )
            .maybeSingle(),

        ]);


        const {
          data,
          error,
        } = detailsResponse;


        if (error) {

          console.error(
            "BATTLE RESULT ERROR:",
            error
          );

          return;
        }


        if (stateResponse.error) {

          console.error(
            "BATTLE STATE ERROR:",
            stateResponse.error
          );

        }


        const battleState =
          stateResponse.data;


        setBattleResult({
          ...data,

          bonus_treasure_pending:
            Boolean(
              battleState
                ?.bonus_treasure_pending ??
              data
                ?.bonus_treasure_pending
            ),

          bonus_treasure_id:
            battleState
              ?.bonus_treasure_id ??
            data
              ?.bonus_treasure_id ??
            null,

          attacker_id:
            data?.attacker_id ??
            battleState?.attacker_id,

          defender_id:
            data?.defender_id ??
            battleState?.defender_id,

          fortress_destroyed:
            Boolean(
              battleState
                ?.fortress_destroyed ??
              data
                ?.fortress_destroyed
            ),

          fortress_card_id:
            battleState
              ?.fortress_card_id ??
            data
              ?.fortress_card_id ??
            null,

          statue_destroyed:
            Boolean(
              battleState
                ?.statue_destroyed ??
              data
                ?.statue_destroyed
            ),

          statue_card_id:
            battleState
              ?.statue_card_id ??
            data
              ?.statue_card_id ??
            null,

          guard_choice_pending:
            Boolean(
              battleState
                ?.guard_choice_pending ??
              data
                ?.guard_choice_pending
            ),

          guard_card_ids:
            battleState
              ?.guard_card_ids ??
            data
              ?.guard_card_ids ??
            [],

          guard_destroyed_card_id:
            battleState
              ?.guard_destroyed_card_id ??
            data
              ?.guard_destroyed_card_id ??
            null,

          guard_destroyed_definition_id:
            battleState
              ?.guard_destroyed_definition_id ??
            data
              ?.guard_destroyed_definition_id ??
            null,

          trouble_card_id:
            battleState
              ?.trouble_card_id ??
            data
              ?.trouble_card_id ??
            null,

          trouble_transfer_count:
            Number(
              battleState
                ?.trouble_transfer_count ??
              data
                ?.trouble_transfer_count ??
              0
            ),

          trouble_transfer_from_id:
            battleState
              ?.trouble_transfer_from_id ??
            data
              ?.trouble_transfer_from_id ??
            null,

          trouble_transfer_to_id:
            battleState
              ?.trouble_transfer_to_id ??
            data
              ?.trouble_transfer_to_id ??
            null,

          treasure_stolen:
            Boolean(
              battleState
                ?.treasure_stolen ??
              data
                ?.treasure_stolen
            ),
        });

      },
      []
    );


  // =========================================================
  // BATTLE GUARD CHOICE — STATUE / FORTRESS
  // =========================================================

  const loadBattleGuardChoice =
    useCallback(
      async () => {

        if (
          !game?.id ||
          !currentUser?.id
        ) {
          setBattleGuardChoice(null);
          return null;
        }

        const {
          data,
          error,
        } =
          await getActiveBattleGuardChoice(
            game.id
          );

        if (error) {
          console.error(
            "GET BATTLE GUARD CHOICE ERROR:",
            error
          );
          setBattleGuardChoiceError(
            error.message
          );
          return null;
        }

        const next =
          data?.active
            ? data
            : null;

        setBattleGuardChoice(
          next
        );

        return next;
      },
      [
        game?.id,
        currentUser?.id,
      ]
    );


  const handleChooseBattleGuard =
    async guardCardId => {

      if (
        !battleGuardChoice?.active ||
        !battleGuardChoice?.can_choose ||
        !battleGuardChoice?.battle_id ||
        !guardCardId ||
        battleGuardChoiceLoading
      ) {
        return;
      }

      setBattleGuardChoiceLoading(true);
      setBattleGuardChoiceError("");

      const battleId =
        battleGuardChoice.battle_id;

      const {
        result,
        error,
      } =
        await chooseBattleGuard(
          battleId,
          guardCardId
        );

      if (error) {
        console.error(
          "CHOOSE BATTLE GUARD ERROR:",
          error
        );
        setBattleGuardChoiceError(
          error.message
        );
        setBattleGuardChoiceLoading(false);
        return;
      }

      console.log(
        "BATTLE GUARD CHOSEN:",
        result
      );

      setBattleGuardChoice(null);

      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();
      await loadFortresses();
      await loadStatues();

      await loadBattleResult(
        battleId
      );

      setBattleGuardChoiceLoading(false);
    };


  // =========================================================
  // SUPPORT SELECTION
  // =========================================================

  const toggleAttackSupport =
    cardId => {

      setAttackSupportCardIds(
        current =>
          current.includes(cardId)
            ? current.filter(
              id =>
                id !== cardId
            )
            : [
              ...current,
              cardId,
            ]
      );
    };


  const toggleDefenseSupport =
    cardId => {

      setDefenseSupportCardIds(
        current =>
          current.includes(cardId)
            ? current.filter(
              id =>
                id !== cardId
            )
            : [
              ...current,
              cardId,
            ]
      );
    };


  // =========================================================
  // ATTACK
  // =========================================================

  const handleStartBattle =
    async treasureId => {

      const cardId =
        attackCardId ||
        draggedBattleCardId;


      if (
        !game ||
        !currentUser ||
        !cardId ||
        battleLoading
      ) {
        return;
      }


      setBattleLoading(true);
      setBattleError("");


      // =======================================================
      // КРИВАВА БИТВА
      // =======================================================

      if (
        attackMode ===
        "trouble"
      ) {

        if (!troubleCardId) {
          setBattleError(
            "Карта Кривава битва не вибрана."
          );
          setBattleLoading(false);
          return;
        }


        setTroubleLoading(true);
        setTroubleError("");


        const {
          result,
          error,
        } =
          await playTrouble(
            game.id,
            troubleCardId,
            treasureId,
            cardId,
            attackSupportCardIds
          );


        if (error) {

          console.error(
            "PLAY TROUBLE ERROR:",
            error
          );

          setTroubleError(
            error.message
          );

          setBattleError(
            error.message
          );

          setBattleLoading(false);
          setTroubleLoading(false);

          return;
        }


        console.log(
          "TROUBLE RESULT:",
          result
        );


        setSelectingTreasure(false);
        setAttackCardId(null);
        setAttackMode("normal");
        setAttackSupportCardIds([]);
        setDraggedBattleCardId(null);
        setHoveredTreasureId(null);
        setSelectedTarget(null);
        setTroubleCardId(null);


        await refreshCards(
          game.id,
          currentUser.id
        );

        await loadGameState();
        await loadActiveBattle(
          game.id
        );


        if (
          result?.energy_reaction
        ) {
          await loadEnergyReaction();
        }


        setBattleLoading(false);
        setTroubleLoading(false);

        return;
      }


      // =======================================================
      // ЗВИЧАЙНА / GROUP OPEN БИТВА
      // =======================================================

      const {
        battleId,
        error,
      } =
        attackMode === "group_open"
          ? await startGroupOpenBattle(
            game.id,
            cardId,
            treasureId,
            attackSupportCardIds
          )
          : await startBattle(
            game.id,
            cardId,
            treasureId,
            attackSupportCardIds
          );


      if (error) {

        console.error(
          "START BATTLE ERROR:",
          error
        );

        setBattleError(
          error.message
        );

        setBattleLoading(false);

        return;
      }


      console.log(
        "BATTLE STARTED:",
        battleId
      );


      setSelectingTreasure(false);
      setAttackCardId(null);
      setAttackMode("normal");
      setAttackSupportCardIds([]);
      setDraggedBattleCardId(null);
      setHoveredTreasureId(null);
      setSelectedTarget(null);


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();


      setBattleLoading(false);
    };


  // =========================================================
  // DEFENSE
  // =========================================================

  const handleBattleResponse =
    async (
      defenseCardId = null,
      supportCardIds = []
    ) => {

      if (
        !activeBattle ||
        !game ||
        !currentUser ||
        battleLoading
      ) {
        return;
      }


      setBattleLoading(true);
      setBattleError("");


      const battleId =
        activeBattle.id;


      const {
        result,
        error,
      } =
        await respondBattle(
          battleId,
          defenseCardId,
          supportCardIds
        );


      if (error) {

        console.error(
          "BATTLE RESPONSE ERROR:",
          error
        );

        setBattleError(
          error.message
        );

        setBattleLoading(false);

        return;
      }


      setSelectedDefenseCardId(null);
      setDefenseSupportCardIds([]);
      setSpyReveal(null);


      // Якщо захист обрано, новий backend НЕ завершує
      // бій одразу. Спочатку відкривається вікно реакцій
      // для "Балачок".
      if (
        result?.reaction_pending
      ) {

        await refreshCards(
          game.id,
          currentUser.id
        );

        await loadGameState();

        setBattleLoading(false);

        return;
      }


      // "Не захищатися" — бій, як і раніше,
      // завершується одразу.
      setActiveBattle(null);


      await loadBattleResult(
        battleId
      );

      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();

      if (
        result?.guard_choice_pending
      ) {
        await loadBattleGuardChoice();
      }


      setBattleLoading(false);
    };


  // =========================================================
  // PRINCESS — CLAIM EXTRA TREASURE
  // =========================================================

  const handleClaimBonusTreasure =
    async treasureId => {

      if (
        !battleResult ||
        !battleResult
          .bonus_treasure_pending ||
        battleResult.attacker_id !==
        currentUser?.id ||
        bonusTreasureLoading
      ) {
        return;
      }


      setBonusTreasureLoading(true);
      setBonusTreasureError("");


      const {
        result,
        error,
      } =
        await claimBonusTreasure(
          battleResult.battle_id,
          treasureId
        );


      if (error) {

        console.error(
          "BONUS TREASURE ERROR:",
          error
        );

        setBonusTreasureError(
          error.message
        );

        setBonusTreasureLoading(false);

        return;
      }


      console.log(
        "BONUS TREASURE RESULT:",
        result
      );


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadBattleResult(
        battleResult.battle_id
      );

      await loadGameState();


      setBonusTreasureLoading(false);
    };


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
  // BAT
  // =========================================================

  const openBat =
    gameCardId => {

      setSelectingTreasure(false);
      setAttackCardId(null);
      setAttackSupportCardIds([]);

      setBatCardId(
        gameCardId
      );

      setBatSelectingTreasure(true);
      setBatTarget(null);
      setBatError("");

      setPreviewCard(null);
      setAlmsMenuOpen(false);
    };


  const closeBat =
    () => {

      if (batLoading) {
        return;
      }

      setBatCardId(null);
      setBatTarget(null);
      setBatSelectingTreasure(false);
      setBatError("");
    };


  const handlePlayBat =
    async () => {

      if (
        !game ||
        !currentUser ||
        !batCardId ||
        !batTarget ||
        batLoading ||
        !canPlayTurn
      ) {
        return;
      }


      setBatLoading(true);
      setBatError("");


      const {
        result,
        error,
      } =
        await playBat(
          game.id,
          batCardId,
          batTarget.id
        );


      if (error) {

        console.error(
          "BAT ERROR:",
          error
        );

        setBatError(
          error.message
        );

        setBatLoading(false);

        return;
      }


      console.log(
        "BAT RESULT:",
        result
      );


      setBatCardId(null);
      setBatTarget(null);
      setBatSelectingTreasure(false);


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();


      setBatLoading(false);
    };


  // =========================================================
  // VILENCIA — МІСЯЦЬ НАД ВАЛЕНСІЄЮ
  // =========================================================

  const handlePlayVilencia =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !canPlayTurn ||
        vilenciaLoading
      ) {
        return;
      }


      setVilenciaLoading(true);
      setVilenciaPlayingCardId(
        gameCardId
      );
      setVilenciaError("");


      const {
        result,
        error,
      } =
        await playVilencia(
          game.id,
          gameCardId
        );


      if (error) {

        console.error(
          "VILENCIA ERROR:",
          error
        );

        setVilenciaError(
          error.message
        );

        setVilenciaLoading(false);
        setVilenciaPlayingCardId(null);

        return;
      }


      console.log(
        "VILENCIA RESULT:",
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


      setVilenciaLoading(false);
    };


  // =========================================================
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
  // ELIXIR — ДУХОВНИЙ ЕЛІКСИР
  // =========================================================

  const openElixir =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !canPlayTurn ||
        elixirLoading
      ) {
        return;
      }


      setElixirLoading(true);
      setElixirError("");
      setElixirSelectedCardId(null);


      const {
        data,
        error,
      } =
        await getElixirOptions(
          game.id
        );


      if (error) {

        console.error(
          "GET ELIXIR OPTIONS ERROR:",
          error
        );

        setElixirError(
          error.message
        );

        setElixirLoading(false);

        return;
      }


      const cards =
        Array.isArray(
          data?.cards
        )
          ? data.cards
          : [];


      setElixirCardId(
        gameCardId
      );

      setElixirOptions(
        cards
      );

      setPreviewCard(null);
      setAlmsMenuOpen(false);


      if (
        cards.length === 0
      ) {
        setElixirError(
          "У кладовищі немає бойових карт."
        );
      }


      setElixirLoading(false);
    };


  const closeElixir =
    () => {

      if (elixirLoading) {
        return;
      }


      setElixirCardId(null);
      setElixirOptions([]);
      setElixirSelectedCardId(null);
      setElixirError("");
    };


  const handlePlayElixir =
    async () => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !elixirCardId ||
        !elixirSelectedCardId ||
        !canPlayTurn ||
        elixirLoading
      ) {
        return;
      }


      setElixirLoading(true);
      setElixirError("");


      const {
        result,
        error,
      } =
        await playElixir(
          game.id,
          elixirCardId,
          elixirSelectedCardId
        );


      if (error) {

        console.error(
          "PLAY ELIXIR ERROR:",
          error
        );

        setElixirError(
          error.message
        );

        setElixirLoading(false);

        return;
      }


      console.log(
        "ELIXIR RESULT:",
        result
      );


      setElixirCardId(null);
      setElixirOptions([]);
      setElixirSelectedCardId(null);

      setPreviewCard(null);
      setAlmsMenuOpen(false);


      await refreshCards(
        game.id,
        currentUser.id
      );

      await loadGameState();


      setElixirLoading(false);
    };


  // =========================================================
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
  // MAJOR FLOOD — ВЕЛИКА ПОВІНЬ
  // =========================================================

  const handlePlayMajorFlood =
    async gameCardId => {

      if (
        !game?.id ||
        !currentUser?.id ||
        !gameCardId ||
        !canPlayTurn ||
        majorFloodLoading
      ) {
        return;
      }


      setMajorFloodLoading(true);
      setMajorFloodPlayingCardId(
        gameCardId
      );
      setMajorFloodError("");


      const {
        result,
        error,
      } =
        await playMajorFlood(
          game.id,
          gameCardId
        );


      if (error) {

        console.error(
          "PLAY MAJOR FLOOD ERROR:",
          error
        );

        setMajorFloodError(
          error.message
        );

        setMajorFloodLoading(false);
        setMajorFloodPlayingCardId(null);

        return;
      }


      console.log(
        "MAJOR FLOOD RESULT:",
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


      setMajorFloodLoading(false);
      setMajorFloodPlayingCardId(null);
    };


  // =========================================================
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
      loadBattleGuardChoice();
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
    setBattleGuardChoice(null);
    setUltraprotectionDiscardIds([]);
    setBattleReactionError("");
    setEnergyReactionError("");
    setBattleGuardChoiceError("");

  }, [
    game?.id,
    game?.phase,
    currentUser?.id,
    loadBattleReaction,
    loadEnergyReaction,
    loadBattleGuardChoice,
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


        await loadBattleResult(
          battleId
        );

        await refreshCards(
          game.id,
          currentUser.id
        );

        await loadGameState();

        if (
          result?.guard_choice_pending
        ) {
          await loadBattleGuardChoice();
        }


        setBattleReactionLoading(false);
      },
      [
        battleReaction,
        battleReactionLoading,
        currentUser?.id,
        game?.id,
        loadBattleResult,
        loadGameState,
        loadBattleGuardChoice,
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
      await loadSpyReveal();


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
      await loadSpyReveal();


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
      await loadSpyReveal();


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
              setSpyReveal(null);
              setUltraprotectionDiscardIds([]);

              await loadBattleGuardChoice();

            } else if (
              phase ===
              "battle_reaction" ||
              phase ===
              "battle_finalize"
            ) {

              setEnergyReaction(null);
              setBattleGuardChoice(null);
              setUltraprotectionDiscardIds([]);

              await loadBattleReaction();

            } else if (
              phase ===
              "energy_reaction"
            ) {

              setBattleReaction(null);
              setBattleGuardChoice(null);
              setSpyReveal(null);

              await loadEnergyReaction();

            } else if (
              phase ===
              "battle_waiting_defense"
            ) {

              setBattleReaction(null);
              setEnergyReaction(null);
              setBattleGuardChoice(null);
              setUltraprotectionDiscardIds([]);

              await loadSpyReveal();

            } else {

              setBattleReaction(null);
              setEnergyReaction(null);
              setBattleGuardChoice(null);
              setSpyReveal(null);
              setUltraprotectionDiscardIds([]);

            }


            await refreshCards(
              gameId,
              currentUser.id
            );

            await loadGameState();
            await loadFortresses();
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
    loadBattleReaction,
    loadEnergyReaction,
    loadBattleGuardChoice,
    loadSpyReveal,
    refreshCards,
    loadGameState,
    loadFortresses,
    loadStatues,
  ]);


  // =========================================================
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
  // COMMON UI HELPERS
  // =========================================================

  const beginAttack =
    (
      gameCardId,
      mode = "normal"
    ) => {

      closeBat();

      setTroubleCardId(null);
      setTroubleError("");

      setAttackCardId(
        gameCardId
      );

      setAttackMode(
        mode
      );

      // Нова атака починається без попередньо вибраних support-карт.
      // Для відкритої атаки Гуртом підтримка також дозволена.
      setAttackSupportCardIds([]);
      setSelectingTreasure(true);
      setAlmsMenuOpen(false);
      setBattleError("");
    };


  const cancelAttack =
    () => {

      setSelectingTreasure(false);
      setAttackCardId(null);
      setAttackMode("normal");
      setAttackSupportCardIds([]);
      setDraggedBattleCardId(null);
      setHoveredTreasureId(null);
      setSelectedTarget(null);
      setBattleError("");
      setTroubleCardId(null);
      setTroubleError("");
    };


  const handleEnemyTreasureClick =
    treasure => {

      if (
        batSelectingTreasure &&
        batCardId
      ) {

        if (
          hasActiveFortress(
            treasure?.owner_id
          )
        ) {

          setBatTarget(null);
          setBatError(
            "🏰 Оборонна фортеця захищає скарби цього гравця. Кажан не може їх украсти."
          );

          return true;
        }


        setBatError("");

        setBatTarget(
          treasure
        );

        return true;
      }


      if (
        selectingTreasure &&
        attackCardId
      ) {

        if (
          attackMode ===
          "trouble"
        ) {

          const targetOwnerId =
            treasure?.owner_id;

          const protectedByFortress =
            Boolean(
              targetOwnerId &&
              activeFortresses.some(
                fortress =>
                  fortress.owner_id ===
                  targetOwnerId
              )
            );

          const protectedByStatue =
            Boolean(
              targetOwnerId &&
              activeStatues.some(
                statue =>
                  statue.owner_id ===
                  targetOwnerId
              )
            );


          if (
            protectedByFortress ||
            protectedByStatue
          ) {

            setSelectedTarget(null);

            setBattleError(
              protectedByFortress
                ? "🏰 Криваву битву не можна оголосити проти гравця з Оборонною фортецею."
                : "🗿 Криваву битву не можна оголосити проти гравця з Величезною статуєю."
            );

            return true;
          }


          setBattleError("");
        }


        setSelectedTarget(
          treasure
        );

        return true;
      }


      return false;
    };


  // =========================================================
  // REALTIME BATTLE
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
          `battle-${gameId}`
        )

        .on(
          "postgres_changes",

          {
            event: "*",
            schema: "public",
            table: "game_battles",
            filter:
              `game_id=eq.${gameId}`,
          },

          async payload => {

            console.log(
              "BATTLE REALTIME:",
              payload
            );


            if (
              payload.eventType ===
              "UPDATE" &&
              payload.new?.status ===
              "resolved"
            ) {

              setActiveBattle(null);

              await loadBattleResult(
                payload.new.id
              );
            }


            await loadActiveBattle(
              gameId
            );

            await refreshCards(
              gameId,
              currentUser.id
            );

            await loadGameState();
            await loadFortresses();
            await loadStatues();
            await loadBattleGuardChoice();
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
    loadActiveBattle,
    refreshCards,
    loadGameState,
    loadBattleResult,
    setActiveBattle,
    loadFortresses,
    loadStatues,
    loadBattleGuardChoice,
  ]);

  const battleTargetTreasure =
    activeBattle?.target_card ??
    null;




  return {

    specialEvent,
    closeSpecialEvent,

    // battle
    activeBattle,
    battleTargetTreasure,

    attackCardId,
    setAttackCardId,

    attackMode,
    groupOpenAttack:
      attackMode === "group_open",

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

    battleCardsRevealed,

    iAmDefender,
    iAmAttacker,
    openAttackCard,

    loadBattleResult,

    handleStartBattle,
    handleBattleResponse,

    beginAttack,
    cancelAttack,
    handleEnemyTreasureClick,


    // card helpers
    isDynamicBattleCard,
    isAttackSupportCard,
    isDefenseSupportCard,

    canAttackWithBattleCard,
    canDefendWithBattleCard,

    getAttackSupportValue,
    getDefenseSupportValue,


    // support
    attackSupportCardIds,
    setAttackSupportCardIds,

    selectedDefenseCardId,
    setSelectedDefenseCardId,

    defenseSupportCardIds,
    setDefenseSupportCardIds,

    attackSupportCards,
    defenseSupportCards,

    attackSupportBonus,
    defenseSupportBonus,

    defenseCards,

    toggleAttackSupport,
    toggleDefenseSupport,


    // princess
    bonusTreasurePending,
    iChooseBonusTreasure,
    bonusTreasureOptions,

    bonusTreasureLoading,
    bonusTreasureError,

    handleClaimBonusTreasure,


    // risky dilemma
    riskyDilemmaCardId,
    riskyDilemmaSelectedIds,
    riskyDilemmaLoading,
    riskyDilemmaError,
    riskyDilemmaCards,

    toggleRiskyDilemmaCard,
    openRiskyDilemma,
    closeRiskyDilemma,
    handlePlayRiskyDilemma,


    // bat
    batCardId,
    batSelectingTreasure,
    batTarget,
    setBatTarget,
    batLoading,
    batError,

    openBat,
    closeBat,
    handlePlayBat,


    // vilencia
    vilenciaLoading,
    vilenciaError,
    vilenciaPlayingCardId,
    handlePlayVilencia,


    // chicken
    chickenCardId,
    chickenTargets,
    chickenSession,
    chickenSelectedSlots,
    chickenLoading,
    chickenError,

    openChicken,
    closeChicken,
    handleStartChicken,
    toggleChickenSlot,
    handleResolveChicken,


    // elf
    elfSession,
    elfSelectedCardId,
    setElfSelectedCardId,
    elfLoading,
    elfError,
    handleStartElf,
    handleResolveElf,


    // elixir
    elixirCardId,
    elixirOptions,
    elixirSelectedCardId,
    setElixirSelectedCardId,
    elixirLoading,
    elixirError,

    openElixir,
    closeElixir,
    handlePlayElixir,


    // rice
    myIngredientCount,
    riceLoading,
    riceError,
    ricePlayingCardId,
    handlePlayRice,

    // major flood
    majorFloodLoading,
    majorFloodError,
    majorFloodPlayingCardId,
    handlePlayMajorFlood,


    // spy
    spyCard,
    spyReveal,
    spyLoading,
    spyError,
    spyPlayingCardId,
    canPlaySpy,
    loadSpyReveal,
    handlePlaySpy,


    // squib
    squibCard,
    squibLoading,
    squibError,
    squibPlayingCardId,
    canPlaySquib,
    handlePlaySquib,
    handlePassSquib,


    // fortress
    activeFortresses,
    myFortress,
    fortressLoading,
    fortressError,
    fortressPlayingCardId,
    hasActiveFortress,
    loadFortresses,
    handlePlayFortress,

    // statue
    activeStatues,
    myStatue,
    statueLoading,
    statueError,
    statuePlayingCardId,
    loadStatues,
    handlePlayStatue,

    // trouble
    troubleCardId,
    troubleLoading,
    troubleError,
    troubleAttackCards,
    myTreasureCount,
    openTrouble,
    closeTrouble,
    beginTroubleAttack,

    // pact with devil
    pactCardId,
    pactTargets,
    pactTargetPlayerId,
    pactLoading,
    pactError,
    openPactDevil,
    closePactDevil,
    setPactTargetPlayerId,
    handlePlayPactDevil,

    // trading winds
    windsCardId,
    windsMyTreasureId,
    windsTargetTreasureId,
    windsOwnTreasures,
    windsOpponentTreasures,
    windsLoading,
    windsError,
    openWinds,
    closeWinds,
    setWindsMyTreasureId,
    setWindsTargetTreasureId,
    handlePlayWinds,

    // silk trade
    silkTradeCardId,
    silkTradeMyIds,
    silkTradeTargetIds,
    silkTradeOwnTreasures,
    silkTradeOpponentTreasures,
    silkTradeLoading,
    silkTradeError,
    openSilkTrade,
    closeSilkTrade,
    toggleSilkTradeMyTreasure,
    toggleSilkTradeTargetTreasure,
    handlePlaySilkTrade,

    // double action
    turnActionState,
    doubleActionLoading,
    doubleActionError,
    doubleActionPlayingCardId,
    loadTurnActionState,
    handlePlayDoubleAction,

    // battle guard choice
    battleGuardChoice,
    battleGuardChoiceLoading,
    battleGuardChoiceError,
    loadBattleGuardChoice,
    handleChooseBattleGuard,

    // temporary treasures
    myTemporaryTreasureIds,
    temporaryTreasureLoading,
    temporaryTreasureError,
    temporaryTreasurePlayingCardId,
    handlePlayTemporaryTreasure,


    // reaction state
    gamePhase:
      game?.phase,

    battleReaction,
    battleReactionLoading,
    battleReactionError,

    handlePassBattleReaction,
    handlePlayChatter,
    handleFinalizeBattleReactions,

    energyReaction,
    energyReactionLoading,
    energyReactionError,
    protectionHandCard,
    ultraprotectionHandCard,

    ultraprotectionDiscardIds,
    ultraprotectionDiscardOptions,

    toggleUltraprotectionDiscard,
    handlePassEnergyReaction,
    handlePlayProtection,
    handlePlayUltraprotection,


    // bazaar
    bazaar,
    bazaarPhase:
      game?.phase === "bazaar",
    bazaarActive,
    bazaarCards,
    bazaarLoading,
    bazaarError,
    bazaarStartingCardId,
    iAmBazaarPicker,

    loadBazaar,
    handleStartBazaar,
    handlePickBazaarCard,
  };
};

export { GameMechanicsUI } from "./mechanics/GameMechanicsUI";
