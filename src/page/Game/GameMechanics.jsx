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
} from "../../services/gameService";

import {
  supabase,
} from "../../services/supabase";

import {
  startBazaar,
  pickBazaarCard,
  getActiveBazaar,
} from "./services/bazaarService";


import {
  getCardImageUrl,
} from "../../services/cardService";

import {
  CARD_BACK_PATH,
} from "./constants/cards";

import style from "../../styles/index.module.css";


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
      card?.effect_key ===
      "SUPPORT_ATTACK_PLUS_1" ||
      card?.effect_key ===
      "SUPPORT_ATTACK_PLUS_1_DEFENSE_PLUS_2";


  const isDefenseSupportCard =
    card =>
      card?.effect_key ===
      "SUPPORT_ATTACK_PLUS_1_DEFENSE_PLUS_2";


  const getAttackSupportValue =
    card => {

      if (
        card?.effect_key ===
        "SUPPORT_ATTACK_PLUS_1"
      ) {
        return 1;
      }

      if (
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

      await loadGameState();


      setVilenciaLoading(false);
      setVilenciaPlayingCardId(null);
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

      await loadGameState();


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


  return {

    // battle
    activeBattle,

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


export const GameMechanicsUI = ({
  mechanics,
  previewCard,
  setPreviewCard,
  canPlayTurn,
  setAlmsMenuOpen,
  getPlayerName,
}) => {

  const {
    attackMode,
    groupOpenAttack,
    selectingTreasure,

    battleLoading,
    battleError,
    setBattleError,

    selectedTarget,
    setSelectedTarget,

    attackSupportCardIds,

    attackSupportCards,
    attackSupportBonus,

    toggleAttackSupport,
    getAttackSupportValue,

    batSelectingTreasure,
    batLoading,
    batError,
    batTarget,
    setBatTarget,
    closeBat,
    handlePlayBat,

    riskyDilemmaCardId,
    riskyDilemmaSelectedIds,
    riskyDilemmaLoading,
    riskyDilemmaError,
    riskyDilemmaCards,

    toggleRiskyDilemmaCard,
    closeRiskyDilemma,
    handlePlayRiskyDilemma,

    openRiskyDilemma,
    openBat,

    vilenciaLoading,
    vilenciaError,
    vilenciaPlayingCardId,
    handlePlayVilencia,

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

    elfSession,
    elfSelectedCardId,
    setElfSelectedCardId,
    elfLoading,
    elfError,
    handleStartElf,
    handleResolveElf,

    elixirCardId,
    elixirOptions,
    elixirSelectedCardId,
    setElixirSelectedCardId,
    elixirLoading,
    elixirError,
    openElixir,
    closeElixir,
    handlePlayElixir,

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

    spyCard,
    spyReveal,
    spyLoading,
    spyError,
    spyPlayingCardId,
    canPlaySpy,
    handlePlaySpy,

    squibCard,
    squibLoading,
    squibError,
    squibPlayingCardId,
    canPlaySquib,
    handlePlaySquib,
    handlePassSquib,

    activeFortresses,
    myFortress,
    fortressLoading,
    fortressError,
    fortressPlayingCardId,
    handlePlayFortress,

    activeStatues,
    myStatue,
    statueLoading,
    statueError,
    statuePlayingCardId,
    handlePlayStatue,

    troubleCardId,
    troubleLoading,
    troubleError,
    troubleAttackCards,
    myTreasureCount,
    openTrouble,
    closeTrouble,
    beginTroubleAttack,

    pactCardId,
    pactTargets,
    pactTargetPlayerId,
    pactLoading,
    pactError,
    openPactDevil,
    closePactDevil,
    setPactTargetPlayerId,
    handlePlayPactDevil,

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

    turnActionState,
    doubleActionLoading,
    doubleActionError,
    doubleActionPlayingCardId,
    handlePlayDoubleAction,

    battleGuardChoice,
    battleGuardChoiceLoading,
    battleGuardChoiceError,
    handleChooseBattleGuard,

    myTemporaryTreasureIds,
    temporaryTreasureLoading,
    temporaryTreasureError,
    temporaryTreasurePlayingCardId,
    handlePlayTemporaryTreasure,

    gamePhase,

    battleReaction,
    battleReactionLoading,
    battleReactionError,
    handlePassBattleReaction,
    handlePlayChatter,

    energyReaction,
    energyReactionLoading,
    energyReactionError,

    ultraprotectionDiscardIds,
    ultraprotectionDiscardOptions,
    toggleUltraprotectionDiscard,
    handlePassEnergyReaction,
    handlePlayProtection,
    handlePlayUltraprotection,

    bazaar,
    bazaarPhase,
    bazaarActive,
    bazaarCards,
    bazaarLoading,
    bazaarError,
    bazaarStartingCardId,
    iAmBazaarPicker,
    handleStartBazaar,
    handlePickBazaarCard,

    handleStartBattle,
    isDynamicBattleCard,
    canAttackWithBattleCard,
    beginAttack,
    cancelAttack,

    activeBattle,
    iAmAttacker,
    iAmDefender,
    openAttackCard,

    defenseCards,
    selectedDefenseCardId,
    setSelectedDefenseCardId,

    defenseSupportCardIds,
    setDefenseSupportCardIds,
    defenseSupportCards,

    toggleDefenseSupport,
    getDefenseSupportValue,
    defenseSupportBonus,

    handleBattleResponse,

    battleResult,
    setBattleResult,
    battleCardsRevealed,

    bonusTreasurePending,
    iChooseBonusTreasure,
    bonusTreasureOptions,
    bonusTreasureLoading,
    bonusTreasureError,
    handleClaimBonusTreasure,
  } = mechanics;


  return (

    <>

      {/* ================================= */}
      {/* DOUBLE ACTION — ACTIONS LEFT */}
      {/* ================================= */}

      {turnActionState?.active && (

        <div
          style={{
            position: "fixed",
            top: "84px",
            left: "16px",
            zIndex: 31,
            padding: "10px 12px",
            borderRadius: "12px",
            background: "rgba(15, 15, 20, 0.9)",
            boxShadow: "0 10px 30px rgba(0,0,0,.28)",
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            maxWidth: "220px",
          }}
        >
          <strong>
            🎭 Дії: {turnActionState.actions_remaining}
          </strong>

          <small>
            {getPlayerName(
              turnActionState.owner_id
            )}
          </small>

          {Number(
            turnActionState.pending_skip_count ?? 0
          ) > 0 && (
              <small>
                🌙 Пропуск після ходу: {
                  turnActionState.pending_skip_count
                }
              </small>
            )}
        </div>

      )}


      {/* ================================= */}
      {/* ACTIVE COLLECTION GUARDS */}
      {/* ================================= */}

      {(
        activeFortresses.length > 0 ||
        activeStatues.length > 0
      ) && (

          <div
            style={{
              position: "fixed",
              top: "84px",
              right: "16px",
              zIndex: 30,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              padding: "10px",
              borderRadius: "12px",
              background: "rgba(15, 15, 20, 0.88)",
              boxShadow: "0 10px 30px rgba(0,0,0,.28)",
              maxWidth: "230px",
            }}
          >

            <strong
              style={{
                fontSize: "12px",
                letterSpacing: ".06em",
              }}
            >
              🛡 ЗАХИСТ КОЛЕКЦІЙ
            </strong>


            {activeFortresses.map(
              fortress => (

                <button
                  key={fortress.game_card_id}
                  type="button"
                  onClick={() =>
                    setPreviewCard({
                      id: fortress.definition_id,
                      name: fortress.name,
                      type: "special",
                      subtype: "normal",
                      power: fortress.power,
                      effect_key: fortress.effect_key,
                      image_path: fortress.image_path,
                    })
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px",
                    border: 0,
                    borderRadius: "9px",
                    background: "rgba(255,255,255,.08)",
                    color: "inherit",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <img
                    src={getCardImageUrl(
                      fortress.image_path
                    )}
                    alt={fortress.name}
                    style={{
                      width: "42px",
                      borderRadius: "6px",
                    }}
                  />

                  <span
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <strong>
                      🏰 {getPlayerName(
                        fortress.owner_id
                      )}
                    </strong>
                    <small>
                      Фортеця · захист від битви та спецкрадіжки
                    </small>
                  </span>
                </button>
              )
            )}


            {activeStatues.map(
              statue => (

                <button
                  key={statue.game_card_id}
                  type="button"
                  onClick={() =>
                    setPreviewCard({
                      id: statue.definition_id,
                      name: statue.name,
                      type: "special",
                      subtype: "normal",
                      power: statue.power,
                      effect_key: statue.effect_key,
                      image_path: statue.image_path,
                    })
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px",
                    border: 0,
                    borderRadius: "9px",
                    background: "rgba(255,255,255,.08)",
                    color: "inherit",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <img
                    src={getCardImageUrl(
                      statue.image_path
                    )}
                    alt={statue.name}
                    style={{
                      width: "42px",
                      borderRadius: "6px",
                    }}
                  />

                  <span
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <strong>
                      🗿 {getPlayerName(
                        statue.owner_id
                      )}
                    </strong>
                    <small>
                      Статуя · захист скарбу від виграної битви
                    </small>
                  </span>
                </button>
              )
            )}

          </div>

        )}


      {/* ================================= */}
      {/* BATTLE GUARD CHOICE */}
      {/* ================================= */}

      {battleGuardChoice?.active && (

        <div
          className={style.overlay}
        >
          <div
            className={style.modal}
          >
            <span
              className={style.eyebrow}
            >
              ВИГРАНА БИТВА
            </span>

            <h2>
              🛡 Обери захисну карту
            </h2>

            <p>
              {
                battleGuardChoice.can_choose
                  ? "Ти виграв битву. Обери, яку карту захисту суперника скинути."
                  : `Очікуємо вибір: ${getPlayerName(
                    battleGuardChoice.attacker_id
                  )}`
              }
            </p>

            <div
              className={style.grid}
            >
              {(
                Array.isArray(
                  battleGuardChoice.cards
                )
                  ? battleGuardChoice.cards
                  : []
              ).map(
                card => (
                  <button
                    key={card.game_card_id}
                    type="button"
                    className={style.gridCard}
                    disabled={
                      !battleGuardChoice.can_choose ||
                      battleGuardChoiceLoading
                    }
                    onClick={() =>
                      handleChooseBattleGuard(
                        card.game_card_id
                      )
                    }
                  >
                    <img
                      src={getCardImageUrl(
                        card.image_path
                      )}
                      alt={card.name}
                    />

                    <span
                      className={style.cardName}
                    >
                      {card.name}
                    </span>

                    <span
                      className={style.cardType}
                    >
                      сила {card.power}
                    </span>
                  </button>
                )
              )}
            </div>

            {battleGuardChoiceLoading && (
              <p className={style.headerSub}>
                Скидаємо карту...
              </p>
            )}

            {battleGuardChoiceError && (
              <p className={style.battleError}>
                {battleGuardChoiceError}
              </p>
            )}
          </div>
        </div>

      )}


      {/* ================================= */}
      {/* TROUBLE / КРИВАВА БИТВА */}
      {/* ================================= */}

      {troubleCardId &&
        attackMode !==
        "trouble" && (

          <div
            className={
              style.overlay
            }
          >

            <div
              className={
                style.modal
              }
            >

              <span
                className={
                  style.eyebrow
                }
              >
                СПЕЦІАЛЬНА КАРТА · СИЛА 3
              </span>

              <div
                className={
                  style.header
                }
              >
                <h2
                  className={
                    style.headerTitle
                  }
                >
                  🩸 Кривава битва
                </h2>
              </div>

              <p
                className={
                  style.headerSub
                }
              >
                Обери бойову карту для атаки.
                Потім обери суперника,
                натиснувши на будь-який його скарб.
                Переможець забере всі скарби
                переможеного.
              </p>


              {myTreasureCount <= 0 ? (

                <p
                  className={
                    style.battleError
                  }
                >
                  У тебе немає скарбів —
                  Криваву битву не можна зіграти.
                </p>

              ) : troubleAttackCards.length > 0 ? (

                <div
                  className={
                    style.grid
                  }
                >

                  {troubleAttackCards.map(
                    gameCard => (

                      <button
                        key={
                          gameCard.id
                        }
                        type="button"
                        className={
                          style.gridCard
                        }
                        disabled={
                          troubleLoading
                        }
                        onClick={() =>
                          beginTroubleAttack(
                            gameCard.id
                          )
                        }
                      >

                        <img
                          src={
                            getCardImageUrl(
                              gameCard.card
                                ?.image_path
                            )
                          }
                          alt={
                            gameCard.card
                              ?.name
                          }
                        />

                        <span
                          className={
                            style.cardName
                          }
                        >
                          {
                            gameCard.card
                              ?.name
                          }
                        </span>

                        <span
                          className={
                            style.cardType
                          }
                        >
                          {isDynamicBattleCard(
                            gameCard.card
                          )
                            ? "⚔ динамічна атака"
                            : `⚔ ${gameCard.card?.attack ?? 0}`
                          }
                        </span>

                      </button>

                    )
                  )}

                </div>

              ) : (

                <p
                  className={
                    style.battleError
                  }
                >
                  У руці немає бойової карти,
                  якою можна атакувати.
                </p>

              )}


              {troubleError && (

                <p
                  className={
                    style.battleError
                  }
                >
                  {troubleError}
                </p>

              )}


              <button
                type="button"
                className={
                  style.cancelAttackButton
                }
                disabled={
                  troubleLoading
                }
                onClick={
                  closeTrouble
                }
              >
                Скасувати
              </button>

            </div>

          </div>

        )}


      {/* ================================= */}
      {/* PACT WITH DEVIL / УГОДА З ДИЯВОЛОМ */}
      {/* ================================= */}

      {pactCardId && (

        <div className={style.overlay}>

          <div className={style.modal}>

            <span className={style.eyebrow}>
              СПЕЦІАЛЬНА КАРТА · СИЛА 1
            </span>


            <h2>
              😈 Угода з дияволом
            </h2>


            <p>
              Обери гравця. Якщо карту не
              переб'ють, ви повністю
              обміняєтесь усіма скарбами.
            </p>


            <p>
              Твої скарби:{" "}
              <strong>
                {myTreasureCount}
              </strong>
            </p>


            {pactTargets.length > 0 ? (

              <div className={style.grid}>

                {pactTargets.map(
                  target => {

                    const selected =
                      pactTargetPlayerId ===
                      target.player_id;

                    const targetTreasureCount =
                      Number(
                        target.treasure_count ?? 0
                      );

                    return (

                      <button
                        key={
                          target.player_id
                        }
                        type="button"
                        className={
                          style.gridCard
                        }
                        disabled={
                          pactLoading
                        }
                        onClick={() =>
                          setPactTargetPlayerId(
                            selected
                              ? null
                              : target.player_id
                          )
                        }
                        style={{
                          boxShadow:
                            selected
                              ? "0 0 0 4px rgba(255,255,255,.9)"
                              : undefined,
                        }}
                      >

                        <strong>
                          😈 {
                            getPlayerName(
                              target.player_id
                            )
                          }
                        </strong>

                        <span>
                          Скарбів: {
                            targetTreasureCount
                          }
                        </span>

                        {selected && (
                          <span>
                            ✓ Обрано
                          </span>
                        )}

                      </button>

                    );
                  }
                )}

              </div>

            ) : (

              <p className={style.battleError}>
                Немає іншого гравця для обміну.
              </p>

            )}


            {pactError && (

              <p className={style.battleError}>
                {pactError}
              </p>

            )}


            <button
              type="button"
              className={
                style.attackButton
              }
              disabled={
                pactLoading ||
                !pactTargetPlayerId
              }
              onClick={
                handlePlayPactDevil
              }
            >
              {
                pactLoading
                  ? "😈 Укладаємо угоду..."
                  : "😈 Підтвердити угоду"
              }
            </button>


            <button
              type="button"
              className={
                style.cancelAttackButton
              }
              disabled={
                pactLoading
              }
              onClick={
                closePactDevil
              }
            >
              Скасувати
            </button>

          </div>

        </div>

      )}


      {/* ================================= */}
      {/* TRADING WINDS / ТОРГОВЕЛЬНІ ВІТРИ */}
      {/* ================================= */}

      {windsCardId && (

        <div className={style.overlay}>
          <div className={style.modal}>

            <span className={style.eyebrow}>
              СПЕЦІАЛЬНА КАРТА · СИЛА 1
            </span>

            <h2>
              🌬️ Торговельні вітри
            </h2>

            <p>
              Обери 1 свій скарб і 1 скарб
              будь-якого іншого гравця.
            </p>

            <h3>
              Твій скарб · {
                windsMyTreasureId ? "1/1" : "0/1"
              }
            </h3>

            {windsOwnTreasures.length > 0 ? (

              <div className={style.grid}>
                {windsOwnTreasures.map(
                  treasure => {

                    const selected =
                      windsMyTreasureId ===
                      treasure.id;

                    return (
                      <button
                        key={treasure.id}
                        type="button"
                        className={style.gridCard}
                        disabled={windsLoading}
                        onClick={() =>
                          setWindsMyTreasureId(
                            selected
                              ? null
                              : treasure.id
                          )
                        }
                        style={{
                          boxShadow:
                            selected
                              ? "0 0 0 4px rgba(255,255,255,.9)"
                              : undefined,
                        }}
                      >
                        <img
                          src={getCardImageUrl(
                            treasure.card?.image_path
                          )}
                          alt={treasure.card?.name}
                        />

                        <strong>
                          {treasure.card?.name}
                        </strong>

                        {selected && (
                          <span>✓ Обрано</span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>

            ) : (
              <p>
                У тебе немає скарбів для обміну.
              </p>
            )}

            <h3>
              Чужий скарб · {
                windsTargetTreasureId ? "1/1" : "0/1"
              }
            </h3>

            {windsOpponentTreasures.length > 0 ? (

              <div className={style.grid}>
                {windsOpponentTreasures.map(
                  treasure => {

                    const selected =
                      windsTargetTreasureId ===
                      treasure.id;

                    return (
                      <button
                        key={treasure.id}
                        type="button"
                        className={style.gridCard}
                        disabled={windsLoading}
                        onClick={() =>
                          setWindsTargetTreasureId(
                            selected
                              ? null
                              : treasure.id
                          )
                        }
                        style={{
                          boxShadow:
                            selected
                              ? "0 0 0 4px rgba(255,255,255,.9)"
                              : undefined,
                        }}
                      >
                        <img
                          src={getCardImageUrl(
                            treasure.card?.image_path
                          )}
                          alt={treasure.card?.name}
                        />

                        <strong>
                          {treasure.card?.name}
                        </strong>

                        <span>
                          {getPlayerName(
                            treasure.owner_id
                          )}
                        </span>

                        {selected && (
                          <span>✓ Обрано</span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>

            ) : (
              <p>
                У суперників немає скарбів для обміну.
              </p>
            )}

            {windsError && (
              <p className={style.battleError}>
                {windsError}
              </p>
            )}

            <button
              type="button"
              className={style.attackButton}
              disabled={
                windsLoading ||
                !windsMyTreasureId ||
                !windsTargetTreasureId
              }
              onClick={handlePlayWinds}
            >
              {windsLoading
                ? "🌬️ Обмінюємо..."
                : "🌬️ Підтвердити обмін"}
            </button>

            <button
              type="button"
              className={style.cancelAttackButton}
              disabled={windsLoading}
              onClick={closeWinds}
            >
              Скасувати
            </button>

          </div>
        </div>

      )}


      {/* ================================= */}
      {/* SILK TRADE / ОБМІН ШОВКОМ */}
      {/* ================================= */}

      {silkTradeCardId && (

        <div
          className={
            style.overlay
          }
        >

          <div
            className={
              style.modal
            }
          >

            <span
              className={
                style.eyebrow
              }
            >
              СПЕЦІАЛЬНА КАРТА · СИЛА 1
            </span>

            <div
              className={
                style.header
              }
            >
              <h2
                className={
                  style.headerTitle
                }
              >
                🧵 Обмін шовком
              </h2>
            </div>

            <p
              className={
                style.headerSub
              }
            >
              Обери рівно 2 свої скарби
              та 2 скарби суперників.
              Порядок вибору задає пари:
              №1 ↔ №1, №2 ↔ №2.
            </p>


            <h3>
              Твої скарби · {silkTradeMyIds.length}/2
            </h3>

            {silkTradeOwnTreasures.length > 0 ? (

              <div
                className={
                  style.grid
                }
              >

                {silkTradeOwnTreasures.map(
                  treasure => {

                    const selectedIndex =
                      silkTradeMyIds.indexOf(
                        treasure.id
                      );

                    return (
                      <button
                        key={
                          treasure.id
                        }
                        type="button"
                        className={
                          style.gridCard
                        }
                        disabled={
                          silkTradeLoading
                        }
                        onClick={() =>
                          toggleSilkTradeMyTreasure(
                            treasure.id
                          )
                        }
                        style={{
                          position: "relative",
                          outline:
                            selectedIndex >= 0
                              ? "3px solid currentColor"
                              : "none",
                        }}
                      >

                        <img
                          src={
                            getCardImageUrl(
                              treasure.card
                                ?.image_path
                            )
                          }
                          alt={
                            treasure.card
                              ?.name
                          }
                        />

                        {selectedIndex >= 0 && (
                          <span
                            style={{
                              position: "absolute",
                              top: "7px",
                              right: "7px",
                              width: "28px",
                              height: "28px",
                              display: "grid",
                              placeItems: "center",
                              borderRadius: "50%",
                              background:
                                "rgba(0,0,0,.82)",
                              color: "#fff",
                              fontWeight: 900,
                            }}
                          >
                            {selectedIndex + 1}
                          </span>
                        )}

                        <span
                          className={
                            style.cardName
                          }
                        >
                          {
                            treasure.card
                              ?.name
                          }
                        </span>

                      </button>
                    );
                  }
                )}

              </div>

            ) : (

              <p
                className={
                  style.battleError
                }
              >
                У тебе немає скарбів.
              </p>

            )}


            <h3>
              Скарби суперників · {silkTradeTargetIds.length}/2
            </h3>

            {silkTradeOpponentTreasures.length > 0 ? (

              <div
                className={
                  style.grid
                }
              >

                {silkTradeOpponentTreasures.map(
                  treasure => {

                    const selectedIndex =
                      silkTradeTargetIds.indexOf(
                        treasure.id
                      );

                    return (
                      <button
                        key={
                          treasure.id
                        }
                        type="button"
                        className={
                          style.gridCard
                        }
                        disabled={
                          silkTradeLoading
                        }
                        onClick={() =>
                          toggleSilkTradeTargetTreasure(
                            treasure.id
                          )
                        }
                        style={{
                          position: "relative",
                          outline:
                            selectedIndex >= 0
                              ? "3px solid currentColor"
                              : "none",
                        }}
                      >

                        <img
                          src={
                            getCardImageUrl(
                              treasure.card
                                ?.image_path
                            )
                          }
                          alt={
                            treasure.card
                              ?.name
                          }
                        />

                        {selectedIndex >= 0 && (
                          <span
                            style={{
                              position: "absolute",
                              top: "7px",
                              right: "7px",
                              width: "28px",
                              height: "28px",
                              display: "grid",
                              placeItems: "center",
                              borderRadius: "50%",
                              background:
                                "rgba(0,0,0,.82)",
                              color: "#fff",
                              fontWeight: 900,
                            }}
                          >
                            {selectedIndex + 1}
                          </span>
                        )}

                        <span
                          className={
                            style.cardName
                          }
                        >
                          {
                            treasure.card
                              ?.name
                          }
                        </span>

                        <span
                          className={
                            style.cardType
                          }
                        >
                          {getPlayerName(
                            treasure.owner_id
                          )}
                        </span>

                      </button>
                    );
                  }
                )}

              </div>

            ) : (

              <p
                className={
                  style.battleError
                }
              >
                Немає доступних скарбів суперників.
              </p>

            )}


            {silkTradeError && (

              <p
                className={
                  style.battleError
                }
              >
                {silkTradeError}
              </p>

            )}


            <button
              type="button"
              className={
                style.attackButton
              }
              disabled={
                silkTradeLoading ||
                silkTradeMyIds.length !== 2 ||
                silkTradeTargetIds.length !== 2
              }
              onClick={
                handlePlaySilkTrade
              }
            >
              {silkTradeLoading
                ? "🧵 Обмінюємо..."
                : "🧵 Підтвердити обмін"}
            </button>


            <button
              type="button"
              className={
                style.cancelAttackButton
              }
              disabled={
                silkTradeLoading
              }
              onClick={
                closeSilkTrade
              }
            >
              Скасувати
            </button>

          </div>

        </div>

      )}


      {/* ================================= */}
      {/* TARGET MODE */}
      {/* ================================= */}


      {selectingTreasure && (

        <>
          <div
            className={
              style.targetMessage
            }
          >

            <strong>
              {attackMode === "trouble"
                ? "🩸 Обери суперника — натисни на будь-який його скарб"
                : "Обери скарб суперника"}
            </strong>

            {attackMode === "trouble" ? (
              <span>
                Кривава битва: переможець
                отримає всі скарби переможеного.
                {" "}
                {attackSupportBonus > 0 &&
                  `Підтримка: ⚔ +${attackSupportBonus}`}
              </span>
            ) : groupOpenAttack ? (
              <span>
                🎺 Відкрита атака Гуртом:
                {" "}
                ⚔ 5
                {attackSupportBonus > 0 &&
                  ` · підтримка +${attackSupportBonus}`}
              </span>
            ) : attackSupportBonus > 0 && (
              <span>
                Підтримка: ⚔ +{
                  attackSupportBonus
                }
              </span>
            )}


            {battleError && (
              <span>
                {battleError}
              </span>
            )}


            <button
              type="button"

              onClick={
                cancelAttack
              }
            >
              Скасувати
            </button>

          </div>


          {attackSupportCards.length > 0 && (

            <div
              className={
                style.attackSupportPanel
              }
            >

              <div
                className={
                  style.supportPanelTitle
                }
              >
                Карти підтримки атаки
              </div>


              <div
                className={
                  style.supportCards
                }
              >

                {attackSupportCards.map(
                  gameCard => {

                    const selected =
                      attackSupportCardIds
                        .includes(
                          gameCard.id
                        );

                    return (

                      <button
                        key={gameCard.id}
                        type="button"
                        className={`
                          ${style.supportCard}
                          ${selected
                            ? style.supportCardSelected
                            : ""
                          }
                        `}
                        onClick={() =>
                          toggleAttackSupport(
                            gameCard.id
                          )
                        }
                      >

                        <img
                          src={
                            getCardImageUrl(
                              gameCard.card?.image_path
                            )
                          }
                          alt={
                            gameCard.card?.name
                          }
                        />

                        <span>
                          ⚔ +{
                            getAttackSupportValue(
                              gameCard.card
                            )
                          }
                        </span>

                      </button>

                    );

                  }
                )}

              </div>

            </div>

          )}
        </>

      )}


      {batSelectingTreasure && (

        <div
          className={
            style.targetMessage
          }
        >

          <strong>
            🦇 Обери скарб суперника
          </strong>


          <button
            type="button"

            disabled={
              batLoading
            }

            onClick={
              closeBat
            }
          >
            Скасувати
          </button>


          {batError && (

            <span>
              {batError}
            </span>

          )}

        </div>

      )}




      {/* ================================= */}
      {/* CHICKEN — TARGET PLAYER */}
      {/* ================================= */}

      {chickenCardId &&
        !chickenSession && (

          <div
            className={
              style.overlay
            }
          >

            <div
              className={
                style.modal
              }
            >
              <span
                className={
                  style.eyebrow
                }
              >
                СПЕЦІАЛЬНА КАРТА
              </span>
              <div
                className={
                  style.header
                }
              >

                <h2 className={style.headerTitle} >
                  🐔 Голодна курка
                </h2>

              </div>

              <p className={style.headerSub}>
                Обери суперника, у якого
                7 або більше карт у руці.
              </p>


              {chickenTargets.length > 0 ? (

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                >

                  {chickenTargets.map(
                    target => (

                      <button
                        key={
                          target.player_id
                        }

                        type="button"

                        className={
                          style.attackButton
                        }

                        disabled={
                          chickenLoading
                        }

                        onClick={() =>
                          handleStartChicken(
                            target.player_id
                          )
                        }
                      >
                        🐔 {
                          getPlayerName(
                            target.player_id
                          )
                        } · {
                          Number(
                            target.hand_count ?? 0
                          )
                        } карт
                      </button>

                    )
                  )}

                </div>

              ) : (

                <p>
                  Немає доступної цілі.
                </p>

              )}


              {chickenError && (

                <p
                  className={
                    style.battleError
                  }
                >
                  {chickenError}
                </p>

              )}


              <button
                type="button"

                className={
                  style.cancelAttackButton
                }

                disabled={
                  chickenLoading
                }

                onClick={
                  closeChicken
                }
              >
                Скасувати
              </button>

            </div>

          </div>

        )}


      {/* ================================= */}
      {/* CHICKEN — CLOSED HAND */}
      {/* ================================= */}

      {chickenSession?.active && (

        <div
          className={
            style.overlay
          }
        >

          <div
            className={
              style.modal
            }
          >
            <div>
              <span
                className={
                  style.eyebrow
                }
              >
                СПЕЦІАЛЬНА КАРТА
              </span>

              <div
                className={
                  style.header
                }
              >


                <h2>
                  🐔 Голодна курка
                </h2>

                {chickenSession.can_choose ? (

                  <p>
                    Обери 3 закриті карти
                    гравця{" "}
                    <strong>
                      {
                        getPlayerName(
                          chickenSession
                            .target_id
                        )
                      }
                    </strong>.
                  </p>

                ) : (

                  <p>
                    {
                      getPlayerName(
                        chickenSession
                          .actor_id
                      )
                    } обирає 3 закриті карти
                    з руки{" "}
                    <strong>
                      {
                        getPlayerName(
                          chickenSession
                            .target_id
                        )
                      }
                    </strong>.
                  </p>

                )}

              </div>


              {chickenSession.can_choose && (

                <div
                  className={
                    style.counter
                  }
                >
                  {
                    chickenSelectedSlots
                      .length
                  }
                  <span>/3</span>
                </div>

              )}

            </div>


            {chickenSession.can_choose ? (

              <>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "10px",
                    maxHeight: "52vh",
                    overflowY: "auto",
                    padding: "10px 4px",
                  }}
                >

                  {Array.from(
                    {
                      length:
                        Number(
                          chickenSession
                            .slot_count ?? 0
                        ),
                    },
                    (_, index) => {
                      const slotNo =
                        index + 1;

                      const selected =
                        chickenSelectedSlots
                          .includes(
                            slotNo
                          );

                      return (

                        <button
                          key={
                            slotNo
                          }

                          type="button"

                          disabled={
                            chickenLoading
                          }

                          onClick={() =>
                            toggleChickenSlot(
                              slotNo
                            )
                          }

                          style={{
                            position: "relative",
                            padding: 0,
                            border: 0,
                            background:
                              "transparent",
                            cursor:
                              chickenLoading
                                ? "default"
                                : "pointer",
                            transform:
                              selected
                                ? "translateY(-10px) scale(1.04)"
                                : "none",
                            opacity:
                              selected
                                ? 1
                                : 0.88,
                            transition:
                              "transform 160ms ease, opacity 160ms ease",
                          }}
                        >

                          <img
                            src={
                              getCardImageUrl(
                                CARD_BACK_PATH
                              )
                            }

                            alt={
                              `Закрита карта ${slotNo}`
                            }

                            style={{
                              width: "92px",
                              display: "block",
                              borderRadius: "8px",
                              boxShadow:
                                selected
                                  ? "0 0 0 4px rgba(255,255,255,.9)"
                                  : "none",
                            }}
                          />


                          {selected && (

                            <span
                              style={{
                                position:
                                  "absolute",
                                top: "6px",
                                right: "6px",
                                width: "28px",
                                height: "28px",
                                display: "grid",
                                placeItems:
                                  "center",
                                borderRadius:
                                  "50%",
                                background:
                                  "rgba(0,0,0,.78)",
                                color: "#fff",
                                fontWeight:
                                  800,
                              }}
                            >
                              ✓
                            </span>

                          )}

                        </button>

                      );
                    }
                  )}

                </div>


                <button
                  type="button"

                  className={
                    style.attackButton
                  }

                  disabled={
                    chickenLoading ||
                    chickenSelectedSlots
                      .length !== 3
                  }

                  onClick={
                    handleResolveChicken
                  }
                >
                  {
                    chickenLoading
                      ? "Крадемо..."
                      : "🐔 Вкрасти 3 карти"
                  }
                </button>

              </>

            ) : (

              <div
                className={
                  style.loading
                }
              >
                Очікуємо, поки гравець
                обере 3 закриті карти...
              </div>

            )}


            {chickenError && (

              <p
                className={
                  style.battleError
                }
              >
                {chickenError}
              </p>

            )}

          </div>

        </div>

      )}


      {/* ================================= */}
      {/* ELF — CHOOSE 1 OF TOP 10 */}
      {/* ================================= */}

      {elfSession?.active && (

        <div
          className={
            style.overlay
          }
        >

          <div
            className={
              style.modal
            }
          >
            <span
              className={
                style.eyebrow
              }
            >
              СПЕЦІАЛЬНА КАРТА
            </span>
            <div
              className={
                style.header
              }
            >

              <div>



                <h2>
                  🧝 Допитливий ельф
                </h2>


                {elfSession.can_choose ? (

                  <p>
                    Обери 1 карту.
                    Решта повернуться
                    до колоди, після чого
                    колода перемішається.
                  </p>

                ) : (

                  <p>
                    {
                      getPlayerName(
                        elfSession.actor_id
                      )
                    } обирає одну
                    з верхніх карт колоди.
                  </p>

                )}

              </div>


              {elfSession.can_choose && (

                <div
                  className={
                    style.counter
                  }
                >
                  {
                    elfSelectedCardId
                      ? 1
                      : 0
                  }
                  <span>/1</span>
                </div>

              )}

            </div>


            {elfSession.can_choose ? (

              <>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(110px, 1fr))",
                    gap: "14px",
                    maxHeight: "58vh",
                    overflowY: "auto",
                    padding: "8px 4px",
                  }}
                >

                  {(
                    Array.isArray(
                      elfSession.cards
                    )
                      ? elfSession.cards
                      : []
                  ).map(
                    card => {

                      const selected =
                        elfSelectedCardId ===
                        card.game_card_id;


                      return (

                        <button
                          key={
                            card.game_card_id
                          }

                          type="button"

                          disabled={
                            elfLoading
                          }

                          onClick={() =>
                            setElfSelectedCardId(
                              card.game_card_id
                            )
                          }


                          style={{
                            position: "relative",
                            padding: "8px",
                            borderRadius: "12px",
                            border:
                              selected
                                ? "3px solid #fff"
                                : "1px solid rgba(255,255,255,.25)",
                            background:
                              selected
                                ? "rgba(255,255,255,.14)"
                                : "rgba(0,0,0,.16)",
                            cursor:
                              elfLoading
                                ? "default"
                                : "pointer",
                            transform:
                              selected
                                ? "translateY(-6px)"
                                : "none",
                            transition:
                              "transform 160ms ease, background 160ms ease",
                            color: 'white',
                          }}
                        >

                          <img
                            src={
                              getCardImageUrl(
                                card.image_path
                              )
                            }

                            alt={
                              card.name
                            }

                            style={{
                              display: "block",
                              width: "100%",
                              maxWidth: "135px",
                              margin: "0 auto",
                              borderRadius: "8px",
                            }}
                          />


                          <strong
                            style={{
                              display: "block",
                              marginTop: "8px",
                              fontSize: "12px",
                              lineHeight: 1.25,
                            }}
                          >
                            {card.name}
                          </strong>


                          {selected && (

                            <span
                              style={{
                                position:
                                  "absolute",
                                top: "12px",
                                right: "12px",
                                width: "28px",
                                height: "28px",
                                display: "grid",
                                placeItems:
                                  "center",
                                borderRadius:
                                  "50%",
                                background:
                                  "rgba(0,0,0,.8)",
                                color: "#fff",
                                fontWeight:
                                  800,
                              }}
                            >
                              ✓
                            </span>

                          )}

                        </button>

                      );
                    }
                  )}

                </div>


                <button
                  type="button"

                  className={
                    style.attackButton
                  }

                  disabled={
                    elfLoading ||
                    !elfSelectedCardId
                  }

                  onClick={
                    handleResolveElf
                  }
                >
                  {
                    elfLoading
                      ? "Зберігаємо..."
                      : "🧝 Залишити цю карту"
                  }
                </button>

              </>

            ) : (

              <div
                className={
                  style.loading
                }
              >
                Очікуємо вибір гравця...
              </div>

            )}


            {elfError && (

              <p
                className={
                  style.battleError
                }
              >
                {elfError}
              </p>

            )}

          </div>

        </div>

      )}


      {/* ================================= */}
      {/* ELIXIR — BATTLE CARD FROM DISCARD */}
      {/* ================================= */}

      {elixirCardId && (

        <div
          className={
            style.overlay
          }
        >

          <div
            className={
              style.modal
            }
          >

            <span
              className={
                style.eyebrow
              }
            >
              СПЕЦІАЛЬНА КАРТА
            </span>


            <div
              className={
                style.header
              }
            >

              <h2
                className={
                  style.headerTitle
                }
              >
                🧪 Духовний еліксир
              </h2>


              <div
                className={
                  style.counter
                }
              >
                {
                  elixirSelectedCardId
                    ? 1
                    : 0
                }
                <span>/1</span>
              </div>

            </div>


            <p
              className={
                style.headerSub
              }
            >
              Обери 1 бойову карту
              з кладовища.
            </p>


            {elixirOptions.length > 0 ? (

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(110px, 1fr))",
                  gap: "14px",
                  maxHeight: "58vh",
                  overflowY: "auto",
                  padding: "8px 4px",
                }}
              >

                {elixirOptions.map(
                  card => {

                    const selected =
                      elixirSelectedCardId ===
                      card.game_card_id;


                    return (

                      <button
                        key={
                          card.game_card_id
                        }

                        type="button"

                        disabled={
                          elixirLoading
                        }

                        onClick={() =>
                          setElixirSelectedCardId(
                            card.game_card_id
                          )
                        }

                        style={{
                          position: "relative",
                          padding: "8px",
                          borderRadius: "12px",
                          border:
                            selected
                              ? "3px solid #fff"
                              : "1px solid rgba(255,255,255,.25)",
                          background:
                            selected
                              ? "rgba(255,255,255,.14)"
                              : "rgba(0,0,0,.16)",
                          color: "white",
                          cursor:
                            elixirLoading
                              ? "default"
                              : "pointer",
                          transform:
                            selected
                              ? "translateY(-6px)"
                              : "none",
                          transition:
                            "transform 160ms ease, background 160ms ease",
                        }}
                      >

                        <img
                          src={
                            getCardImageUrl(
                              card.image_path
                            )
                          }

                          alt={
                            card.name
                          }

                          style={{
                            display: "block",
                            width: "100%",
                            maxWidth: "135px",
                            margin: "0 auto",
                            borderRadius: "8px",
                          }}
                        />


                        <strong
                          style={{
                            display: "block",
                            marginTop: "8px",
                            fontSize: "12px",
                            lineHeight: 1.25,
                          }}
                        >
                          {card.name}
                        </strong>


                        {selected && (

                          <span
                            style={{
                              position:
                                "absolute",
                              top: "12px",
                              right: "12px",
                              width: "28px",
                              height: "28px",
                              display: "grid",
                              placeItems:
                                "center",
                              borderRadius:
                                "50%",
                              background:
                                "rgba(0,0,0,.8)",
                              color: "#fff",
                              fontWeight:
                                800,
                            }}
                          >
                            ✓
                          </span>

                        )}

                      </button>

                    );
                  }
                )}

              </div>

            ) : (

              <p
                className={
                  style.headerSub
                }
              >
                У кладовищі немає
                бойових карт.
              </p>

            )}


            {elixirError && (

              <p
                className={
                  style.battleError
                }
              >
                {elixirError}
              </p>

            )}


            <button
              type="button"

              className={
                style.attackButton
              }

              disabled={
                elixirLoading ||
                !elixirSelectedCardId
              }

              onClick={
                handlePlayElixir
              }
            >
              {
                elixirLoading
                  ? "Повертаємо карту..."
                  : "🧪 Взяти карту"
              }
            </button>


            <button
              type="button"

              className={
                style.cancelAttackButton
              }

              disabled={
                elixirLoading
              }

              onClick={
                closeElixir
              }
            >
              Скасувати
            </button>

          </div>

        </div>

      )}


      {/* ================================= */}
      {/* BATTLE REACTION — БАЛАЧКИ */}
      {/* ================================= */}

      {battleReaction?.active &&
        !energyReaction?.active && (

          <div
            className={
              style.overlay
            }
          >

            <div
              className={
                style.modal
              }
            >

              <span
                className={
                  style.eyebrow
                }
              >
                РЕАКЦІЯ В БОЮ
              </span>


              <div
                className={
                  style.header
                }
              >

                <h2
                  className={
                    style.headerTitle
                  }
                >
                  💬 Балачки
                </h2>


                <div
                  className={
                    style.counter
                  }
                >
                  {
                    Number(
                      battleReaction
                        .pass_count ?? 0
                    )
                  }
                  <span>/2</span>
                </div>

              </div>


              <p
                className={
                  style.headerSub
                }
              >
                Бойові карти відкрито.
                Атакуючий і захисник можуть
                зіграти «Балачки» або
                пропустити реакцію.
              </p>


              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "18px",
                  margin: "20px 0",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >

                  <strong>
                    ⚔ Атака
                  </strong>


                  {battleReaction
                    .attack_card && (

                      <img
                        src={
                          getCardImageUrl(
                            battleReaction
                              .attack_card
                              .image_path
                          )
                        }

                        alt={
                          battleReaction
                            .attack_card
                            .name
                        }

                        style={{
                          width: "125px",
                          maxWidth: "100%",
                          borderRadius: "9px",
                        }}
                      />

                    )}


                  <span>
                    {
                      battleReaction
                        .attack_card
                        ?.name ??
                      "Карта атаки"
                    }
                  </span>


                  {Number(
                    battleReaction
                      .attack_reaction_delta ??
                    0
                  ) < 0 && (

                      <strong>
                        💬 {
                          battleReaction
                            .attack_reaction_delta
                        }
                      </strong>

                    )}

                </div>


                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >

                  <strong>
                    🛡 Захист
                  </strong>


                  {battleReaction
                    .defense_card && (

                      <img
                        src={
                          getCardImageUrl(
                            battleReaction
                              .defense_card
                              .image_path
                          )
                        }

                        alt={
                          battleReaction
                            .defense_card
                            .name
                        }

                        style={{
                          width: "125px",
                          maxWidth: "100%",
                          borderRadius: "9px",
                        }}
                      />

                    )}


                  <span>
                    {
                      battleReaction
                        .defense_card
                        ?.name ??
                      "Карта захисту"
                    }
                  </span>


                  {Number(
                    battleReaction
                      .defense_reaction_delta ??
                    0
                  ) < 0 && (

                      <strong>
                        💬 {
                          battleReaction
                            .defense_reaction_delta
                        }
                      </strong>

                    )}

                </div>

              </div>


              {battleReaction
                .can_play_chatter && (

                  <button
                    type="button"

                    className={
                      style.attackButton
                    }

                    disabled={
                      battleReactionLoading
                    }

                    onClick={
                      handlePlayChatter
                    }
                  >
                    {
                      battleReactionLoading
                        ? "Розігруємо..."
                        : battleReaction
                          .chatter_target_stat ===
                          "attack"
                          ? "💬 Балачки · атака суперника -1"
                          : "💬 Балачки · захист суперника -1"
                    }
                  </button>

                )}


              {battleReaction
                .can_pass && (

                  <button
                    type="button"

                    className={
                      style.cancelAttackButton
                    }

                    disabled={
                      battleReactionLoading
                    }

                    onClick={
                      handlePassBattleReaction
                    }
                  >
                    Пропустити
                  </button>

                )}


              {battleReaction
                .already_passed &&
                !battleReaction
                  .ready_to_finalize && (

                  <p
                    className={
                      style.headerSub
                    }
                  >
                    ✓ Ти пропустив.
                    Очікуємо рішення суперника.
                  </p>

                )}


              {battleReaction
                .ready_to_finalize && (

                  <p
                    className={
                      style.headerSub
                    }
                  >
                    ⚔ Реакції завершено.
                    Підраховуємо результат бою...
                  </p>

                )}


              {!battleReaction
                .can_pass &&
                !battleReaction
                  .already_passed &&
                !battleReaction
                  .ready_to_finalize && (

                  <p
                    className={
                      style.headerSub
                    }
                  >
                    Очікуємо рішення атакуючого
                    та захисника...
                  </p>

                )}


              {battleReactionError && (

                <p
                  className={
                    style.battleError
                  }
                >
                  {battleReactionError}
                </p>

              )}

            </div>

          </div>

        )}


      {/* ================================= */}
      {/* ENERGY REACTION — ЗАХИСТ / УЛЬТРАЗАХИСТ */}
      {/* ================================= */}

      {energyReaction?.active && (

        <div
          className={
            style.overlay
          }
        >

          <div
            className={
              style.modal
            }
          >

            <span
              className={
                style.eyebrow
              }
            >
              ⚡ ЕНЕРГЕТИЧНА РЕАКЦІЯ
            </span>


            <div
              className={
                style.header
              }
            >

              <h2
                className={
                  style.headerTitle
                }
              >
                🛡 Захист від енергетичної карти
              </h2>

            </div>


            <p
              className={
                style.headerSub
              }
            >
              {
                getPlayerName(
                  energyReaction
                    .actor_id
                )
              } зіграв енергетичну карту.
            </p>


            {energyReaction
              .energy_card && (

                <div
                  style={{
                    margin: "16px auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >

                  <img
                    src={
                      getCardImageUrl(
                        energyReaction
                          .energy_card
                          .image_path
                      )
                    }

                    alt={
                      energyReaction
                        .energy_card
                        .name
                    }

                    style={{
                      width: "130px",
                      maxWidth: "40vw",
                      borderRadius: "9px",
                    }}
                  />

                  <strong>
                    {
                      energyReaction
                        .energy_card
                        .name
                    }
                  </strong>

                  <span
                    className={
                      style.headerSub
                    }
                  >
                    🔥 Сила: {
                      Number(
                        energyReaction
                          .energy_power ??
                        energyReaction
                          .energy_card
                          ?.power ??
                        0
                      )
                    }
                  </span>

                </div>

              )}


            {energyReaction
              .can_play_protection && (

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >

                  <p
                    className={
                      style.headerSub
                    }
                  >
                    «Захист паельї» має силу 2
                    та може заблокувати цю
                    енергетичну карту без
                    додаткового скидання карт.
                  </p>


                  <button
                    type="button"

                    className={
                      style.attackButton
                    }

                    disabled={
                      energyReactionLoading
                    }

                    onClick={
                      handlePlayProtection
                    }
                  >
                    {
                      energyReactionLoading
                        ? "Розігруємо..."
                        : "🛡 Захист паельї (2)"
                    }
                  </button>

                </div>

              )}


            {energyReaction
              .can_play_ultraprotection && (

                <div
                  style={{
                    marginTop: "14px",
                    paddingTop: "14px",
                    borderTop:
                      "1px solid rgba(255,255,255,.14)",
                  }}
                >

                  <p
                    className={
                      style.headerSub
                    }
                  >
                    «Ультразахист паельї» має
                    силу 9. Щоб зіграти його,
                    скинь{" "}
                    <strong>
                      {
                        Number(
                          energyReaction
                            .required_discard_count ??
                          0
                        )
                      }
                    </strong>
                    {" "}
                    карт зі своєї доступної
                    руки.
                  </p>


                  {Number(
                    energyReaction
                      .required_discard_count ??
                    0
                  ) > 0 && (

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(90px, 1fr))",
                          gap: "12px",
                          maxHeight: "42vh",
                          overflowY: "auto",
                          padding: "8px 4px",
                        }}
                      >

                        {ultraprotectionDiscardOptions
                          .map(
                            gameCard => {

                              const selected =
                                ultraprotectionDiscardIds
                                  .includes(
                                    gameCard.id
                                  );


                              return (

                                <button
                                  key={
                                    gameCard.id
                                  }

                                  type="button"

                                  disabled={
                                    energyReactionLoading
                                  }

                                  onClick={() =>
                                    toggleUltraprotectionDiscard(
                                      gameCard.id
                                    )
                                  }

                                  style={{
                                    position: "relative",
                                    padding: "7px",
                                    borderRadius: "10px",
                                    border:
                                      selected
                                        ? "3px solid #fff"
                                        : "1px solid rgba(255,255,255,.25)",
                                    background:
                                      selected
                                        ? "rgba(255,255,255,.14)"
                                        : "rgba(0,0,0,.16)",
                                    color: "white",
                                    cursor:
                                      energyReactionLoading
                                        ? "default"
                                        : "pointer",
                                  }}
                                >

                                  <img
                                    src={
                                      getCardImageUrl(
                                        gameCard
                                          .card
                                          ?.image_path
                                      )
                                    }

                                    alt={
                                      gameCard
                                        .card
                                        ?.name
                                    }

                                    style={{
                                      display: "block",
                                      width: "100%",
                                      maxWidth: "110px",
                                      margin: "0 auto",
                                      borderRadius: "7px",
                                    }}
                                  />


                                  {selected && (

                                    <span
                                      style={{
                                        position: "absolute",
                                        top: "10px",
                                        right: "10px",
                                        width: "26px",
                                        height: "26px",
                                        display: "grid",
                                        placeItems: "center",
                                        borderRadius: "50%",
                                        background:
                                          "rgba(0,0,0,.82)",
                                        color: "#fff",
                                        fontWeight: 800,
                                      }}
                                    >
                                      ✓
                                    </span>

                                  )}

                                </button>

                              );
                            }
                          )}

                      </div>

                    )}


                  <p
                    className={
                      style.headerSub
                    }
                  >
                    Обрано:{" "}
                    {
                      ultraprotectionDiscardIds
                        .length
                    }
                    /
                    {
                      Number(
                        energyReaction
                          .required_discard_count ??
                        0
                      )
                    }
                  </p>


                  <button
                    type="button"

                    className={
                      style.attackButton
                    }

                    disabled={
                      energyReactionLoading ||
                      ultraprotectionDiscardIds
                        .length !==
                      Number(
                        energyReaction
                          .required_discard_count ??
                        0
                      )
                    }

                    onClick={
                      handlePlayUltraprotection
                    }
                  >
                    {
                      energyReactionLoading
                        ? "Блокуємо..."
                        : "🛡 Ультразахист паельї (9)"
                    }
                  </button>

                </div>

              )}


            {energyReaction
              .can_pass && (

                <button
                  type="button"

                  className={
                    style.cancelAttackButton
                  }

                  disabled={
                    energyReactionLoading
                  }

                  onClick={
                    handlePassEnergyReaction
                  }
                >
                  Пропустити
                </button>

              )}


            {!energyReaction
              .can_play_protection &&
              !energyReaction
                .can_play_ultraprotection && (

                <p
                  className={
                    style.headerSub
                  }
                >
                  {
                    energyReaction
                      .already_passed
                      ? "✓ Ти пропустив. Очікуємо інших гравців."
                      : "Очікуємо рішення інших гравців із доступним захистом..."
                  }
                </p>

              )}


            {energyReactionError && (

              <p
                className={
                  style.battleError
                }
              >
                {energyReactionError}
              </p>

            )}

          </div>

        </div>

      )}


      {/* ================================= */}
      {/* BAZAAR */}
      {/* ================================= */}

      {(
        bazaarActive ||
        bazaarPhase
      ) && (

          <div
            className={
              style.overlay
            }
          >

            <div
              className={
                style.modal
              }
            >

              <div
                className={
                  style.header
                }
              >

                <div>
                  <span
                    className={
                      style.eyebrow
                    }
                  >
                    СПЕЦІАЛЬНА КАРТА
                  </span>

                  <h2>
                    🏪 Чудернацький базар
                  </h2>

                  <p>
                    По черзі оберіть по одній
                    відкритій карті.
                  </p>
                </div>


                {bazaarActive && (

                  <div
                    className={
                      style.counter
                    }
                  >
                    {bazaar?.remaining_count ??
                      bazaarCards.length}
                    <span>
                      /
                      {bazaar?.total_cards ??
                        bazaarCards.length}
                    </span>
                  </div>

                )}

              </div>


              {!bazaarActive ? (

                <div
                  className={
                    style.loading
                  }
                >
                  Відкриваємо карти Базару...
                </div>

              ) : (

                <>

                  <div
                    className={`${style.turnBanner
                      } ${iAmBazaarPicker
                        ? style.myTurn
                        : ""
                      }`}
                  >

                    {iAmBazaarPicker
                      ? "✨ Твій вибір — обери одну карту"
                      : `Очікуємо вибір: ${getPlayerName(
                        bazaar
                          ?.current_picker_id
                      )
                      }`}

                  </div>


                  <div
                    className={
                      style.grid
                    }
                  >

                    {bazaarCards.map(
                      card => (

                        <button
                          key={
                            card.game_card_id
                          }

                          type="button"

                          disabled={
                            !iAmBazaarPicker ||
                            bazaarLoading
                          }

                          className={
                            style.gridCard
                          }

                          onClick={() =>
                            handlePickBazaarCard(
                              card.game_card_id
                            )
                          }
                        >

                          <img
                            src={
                              getCardImageUrl(
                                card.image_path
                              )
                            }

                            alt={
                              card.name
                            }
                          />

                          <span
                            className={
                              style.cardName
                            }
                          >
                            {card.name}
                          </span>

                          <span
                            className={
                              style.cardType
                            }
                          >
                            {card.type}
                          </span>

                        </button>

                      )
                    )}

                  </div>


                  {bazaarLoading && (

                    <div
                      className={
                        style.status
                      }
                    >
                      Зберігаємо вибір...
                    </div>

                  )}

                </>

              )}


              {bazaarError && (

                <div
                  className={
                    style.error
                  }
                >
                  {bazaarError}
                </div>

              )}

            </div>

          </div>

        )}


      {/* ================================= */}
      {/* CARD PREVIEW */}
      {/* ================================= */}

      {/* ================================= */}
      {/* RISKY DILEMMA */}
      {/* ================================= */}


      {riskyDilemmaCardId && (

        <div
          className={
            style.riskyDilemmaOverlay
          }
        >

          <div
            className={
              style.riskyDilemmaModal
            }
          >

            <h2>
              🎲 Ризикована дилема
            </h2>


            <p>
              Обери до 5 карт із руки,
              які хочеш скинути.
            </p>


            <div
              className={
                style.riskyDilemmaCounter
              }
            >
              Обрано:
              {" "}
              <strong>
                {
                  riskyDilemmaSelectedIds
                    .length
                }
                /5
              </strong>
            </div>


            {riskyDilemmaCards.length >
              0 ? (

              <div
                className={
                  style.riskyDilemmaCards
                }
              >

                {riskyDilemmaCards.map(
                  gameCard => {

                    const selected =
                      riskyDilemmaSelectedIds
                        .includes(
                          gameCard.id
                        );


                    return (

                      <button
                        type="button"

                        key={
                          gameCard.id
                        }

                        disabled={
                          riskyDilemmaLoading
                        }

                        className={`
                          ${style.riskyDilemmaCard}

                          ${selected
                            ? style.riskyDilemmaCardSelected
                            : ""
                          }
                        `}

                        onClick={() =>
                          toggleRiskyDilemmaCard(
                            gameCard.id
                          )
                        }
                      >

                        <img
                          src={
                            getCardImageUrl(
                              gameCard
                                .card
                                ?.image_path
                            )
                          }

                          alt={
                            gameCard
                              .card
                              ?.name
                          }
                        />


                        {selected && (

                          <span
                            className={
                              style.riskyDilemmaCheck
                            }
                          >
                            ✓
                          </span>

                        )}

                      </button>

                    );

                  }
                )}

              </div>

            ) : (

              <p>
                У руці немає інших карт.
              </p>

            )}


            {riskyDilemmaError && (

              <p
                className={
                  style.battleError
                }
              >
                {
                  riskyDilemmaError
                }
              </p>

            )}


            <div
              className={
                style.riskyDilemmaActions
              }
            >

              <button
                type="button"

                disabled={
                  riskyDilemmaLoading
                }

                className={
                  style.riskyDilemmaPlay
                }

                onClick={
                  handlePlayRiskyDilemma
                }
              >

                {riskyDilemmaLoading

                  ? "Розігруємо..."

                  : riskyDilemmaSelectedIds
                    .length > 0

                    ? `Скинути ${riskyDilemmaSelectedIds.length} і взяти ${riskyDilemmaSelectedIds.length}`

                    : "Зіграти без скидання"}

              </button>


              <button
                type="button"

                disabled={
                  riskyDilemmaLoading
                }

                className={
                  style.riskyDilemmaCancel
                }

                onClick={
                  closeRiskyDilemma
                }
              >
                Скасувати
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ================================= */}
      {/* BAT TARGET */}
      {/* ================================= */}


      {batTarget &&
        batSelectingTreasure && (

          <div
            className={
              style.targetPreviewOverlay
            }

            onClick={() =>
              setBatTarget(
                null
              )
            }
          >

            <div
              className={
                style.targetPreview
              }

              onClick={
                event =>
                  event.stopPropagation()
              }
            >

              <div
                className={
                  style.targetPreviewTitle
                }
              >
                🦇 Вкрасти цей скарб?
              </div>


              <img
                src={
                  getCardImageUrl(
                    batTarget
                      .card
                      ?.image_path
                  )
                }

                alt={
                  batTarget
                    .card
                    ?.name
                }
              />


              <h2>
                {
                  batTarget
                    .card
                    ?.name
                }
              </h2>


              {batError && (

                <p
                  className={
                    style.battleError
                  }
                >
                  {batError}
                </p>

              )}


              <div
                className={
                  style.targetPreviewActions
                }
              >

                <button
                  type="button"

                  disabled={
                    batLoading
                  }

                  className={
                    style.confirmAttackButton
                  }

                  onClick={
                    handlePlayBat
                  }
                >

                  {batLoading
                    ? "Крадемо..."
                    : "🦇 Вкрасти скарб"}

                </button>


                <button
                  type="button"

                  disabled={
                    batLoading
                  }

                  className={
                    style.cancelAttackButton
                  }

                  onClick={() =>
                    setBatTarget(
                      null
                    )
                  }
                >
                  Інший скарб
                </button>

              </div>

            </div>

          </div>

        )}


      {selectedTarget &&
        selectingTreasure && (

          <div
            className={
              style.targetPreviewOverlay
            }

            onClick={() =>
              setSelectedTarget(
                null
              )
            }
          >

            <div
              className={
                style.targetPreview
              }

              onClick={
                event =>
                  event.stopPropagation()
              }
            >

              <div
                className={
                  style.targetPreviewTitle
                }
              >
                {attackMode === "trouble"
                  ? "🩸 Оголосити Криваву битву проти цього гравця?"
                  : "⚔ Ти хочеш забрати цей скарб?"}
              </div>


              <img
                src={
                  getCardImageUrl(
                    selectedTarget
                      .card
                      ?.image_path
                  )
                }

                alt={
                  selectedTarget
                    .card
                    ?.name
                }
              />


              <h2>
                {
                  selectedTarget
                    .card
                    ?.name
                }
              </h2>


              <div
                className={
                  style.targetPreviewActions
                }
              >

                <button
                  type="button"

                  disabled={
                    battleLoading
                  }

                  className={
                    style.confirmAttackButton
                  }

                  onClick={() =>
                    handleStartBattle(
                      selectedTarget.id
                    )
                  }
                >
                  {battleLoading
                    ? attackMode === "trouble"
                      ? "🩸 Оголошуємо битву..."
                      : "Атакуємо..."
                    : attackMode === "trouble"
                      ? attackSupportBonus > 0
                        ? `🩸 Битися за всі скарби · підтримка +${attackSupportBonus}`
                        : "🩸 Битися за всі скарби"
                      : groupOpenAttack
                        ? attackSupportBonus > 0
                          ? `🎺 Відкрита атака · ⚔ 5 + підтримка +${attackSupportBonus}`
                          : "🎺 Відкрита атака · ⚔ 5"
                        : attackSupportBonus > 0
                          ? `⚔ Атакувати · підтримка +${attackSupportBonus}`
                          : "⚔ Атакувати цей скарб"}
                </button>


                <button
                  type="button"

                  disabled={
                    battleLoading
                  }

                  className={
                    style.cancelAttackButton
                  }

                  onClick={() =>
                    setSelectedTarget(
                      null
                    )
                  }
                >
                  Інший скарб
                </button>

              </div>

            </div>

          </div>

        )}


      {previewCard && (

        <div
          className={
            style.cardPreviewOverlay
          }

          onClick={() =>
            setPreviewCard(
              null
            )
          }
        >

          <div
            className={
              style.cardPreviewModal
            }

            onClick={
              event =>
                event.stopPropagation()
            }
          >

            <img
              className={
                style.previewImage
              }

              src={
                getCardImageUrl(
                  previewCard
                    .image_path
                )
              }

              alt={
                previewCard.name
              }
            />


            <div
              className={
                style.previewInfo
              }
            >

              <span
                className={
                  style.previewType
                }
              >

                {
                  previewCard.type
                }

                {previewCard.subtype &&
                  ` · ${previewCard.subtype}`}

              </span>


              <h2>
                {
                  previewCard.name
                }
              </h2>


              {previewCard.attack !== null &&
                previewCard.attack !== undefined && (

                  <div
                    className={
                      style.previewStat
                    }
                  >

                    <span>
                      ⚔ Атака
                    </span>

                    <strong>
                      {
                        previewCard.attack
                      }
                    </strong>

                  </div>

                )}


              {previewCard.defense !== null &&
                previewCard.defense !== undefined && (

                  <div
                    className={
                      style.previewStat
                    }
                  >

                    <span>
                      🛡 Захист
                    </span>

                    <strong>
                      {
                        previewCard.defense
                      }
                    </strong>

                  </div>

                )}


              {isDynamicBattleCard(
                previewCard
              ) && (

                  <>
                    <div
                      className={
                        style.previewStat
                      }
                    >
                      <span>
                        ⚔ Атака
                      </span>

                      <strong>
                        = скарби суперника
                      </strong>
                    </div>

                    <div
                      className={
                        style.previewStat
                      }
                    >
                      <span>
                        🛡 Захист
                      </span>

                      <strong>
                        = скарби суперника
                      </strong>
                    </div>
                  </>

                )}


              {previewCard.power !== null &&
                previewCard.power !== undefined && (

                  <div
                    className={
                      style.previewStat
                    }
                  >

                    <span>
                      ✦ Сила
                    </span>

                    <strong>
                      {
                        previewCard.power
                      }
                    </strong>

                  </div>

                )}


              {/* RISKY DILEMMA */}


              {previewCard.id ===
                "player-petrer" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <button
                    type="button"

                    className={
                      style.attackButton
                    }

                    onClick={() =>
                      openRiskyDilemma(
                        previewCard
                          .gameCardId
                      )
                    }
                  >
                    🎲 Зіграти
                  </button>

                )}


              {/* BAT */}


              {previewCard.id ===
                "bat" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <button
                    type="button"

                    className={
                      style.attackButton
                    }

                    onClick={() =>
                      openBat(
                        previewCard
                          .gameCardId
                      )
                    }
                  >
                    🦇 Зіграти
                  </button>

                )}


              {/* CHICKEN / ГОЛОДНА КУРКА */}


              {previewCard.id ===
                "chicken" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <button
                    type="button"

                    className={
                      style.attackButton
                    }

                    disabled={
                      chickenLoading
                    }

                    onClick={() =>
                      openChicken(
                        previewCard
                          .gameCardId
                      )
                    }
                  >
                    {
                      chickenLoading
                        ? "🐔 Перевіряємо..."
                        : "🐔 Зіграти"
                    }
                  </button>

                )}


              {/* ELF / ДОПИТЛИВИЙ ЕЛЬФ */}


              {previewCard.id ===
                "elf" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <>

                    <button
                      type="button"

                      className={
                        style.attackButton
                      }

                      disabled={
                        elfLoading
                      }

                      onClick={() =>
                        handleStartElf(
                          previewCard
                            .gameCardId
                        )
                      }
                    >
                      {
                        elfLoading
                          ? "🧝 Відкриваємо..."
                          : "🧝 Зіграти"
                      }
                    </button>


                    {elfError && (

                      <p
                        className={
                          style.battleError
                        }
                      >
                        {elfError}
                      </p>

                    )}

                  </>

                )}


              {/* ELIXIR / ДУХОВНИЙ ЕЛІКСИР */}


              {previewCard.id ===
                "elixir" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <>

                    <button
                      type="button"

                      className={
                        style.attackButton
                      }

                      disabled={
                        elixirLoading
                      }

                      onClick={() =>
                        openElixir(
                          previewCard
                            .gameCardId
                        )
                      }
                    >
                      {
                        elixirLoading
                          ? "🧪 Відкриваємо кладовище..."
                          : "🧪 Зіграти"
                      }
                    </button>


                    {elixirError && (
                      !elixirCardId
                    ) && (

                        <p
                          className={
                            style.battleError
                          }
                        >
                          {elixirError}
                        </p>

                      )}

                  </>

                )}


              {/* RICE / ХРУСТКИЙ РИС */}


              {previewCard.id ===
                "rice" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <>

                    {myIngredientCount >= 4 ? (

                      <button
                        type="button"

                        className={
                          style.attackButton
                        }

                        disabled={
                          riceLoading
                        }

                        onClick={() =>
                          handlePlayRice(
                            previewCard
                              .gameCardId
                          )
                        }
                      >
                        {
                          riceLoading &&
                            ricePlayingCardId ===
                            previewCard.gameCardId
                            ? "🍚 Розігруємо..."
                            : "🍚 Зіграти"
                        }
                      </button>

                    ) : (

                      <p
                        className={
                          style.headerSub
                        }
                      >
                        🍴 Для «Хрусткого рису»
                        потрібно щонайменше 4
                        інгредієнти. Зараз: {
                          myIngredientCount
                        }/4.
                      </p>

                    )}


                    {riceError && (

                      <p
                        className={
                          style.battleError
                        }
                      >
                        {riceError}
                      </p>

                    )}

                  </>

                )}



              {/* MAJOR FLOOD / ВЕЛИКА ПОВІНЬ */}

              {previewCard.id ===
                "major-flood" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <>

                    <button
                      type="button"

                      className={
                        style.attackButton
                      }

                      disabled={
                        majorFloodLoading
                      }

                      onClick={() =>
                        handlePlayMajorFlood(
                          previewCard
                            .gameCardId
                        )
                      }
                    >
                      {
                        majorFloodLoading &&
                          majorFloodPlayingCardId ===
                          previewCard.gameCardId
                          ? "🌊 Змиваємо скарби..."
                          : "🌊 Зіграти"
                      }
                    </button>


                    {majorFloodError && (

                      <p
                        className={
                          style.battleError
                        }
                      >
                        {majorFloodError}
                      </p>

                    )}

                  </>

                )}


              {/* DOUBLE ACTION / ПОДВІЙНІ НЕПРИЄМНОСТІ */}


              {previewCard.id ===
                "double-action" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <>

                    <button
                      type="button"
                      className={
                        style.attackButton
                      }
                      disabled={
                        doubleActionLoading
                      }
                      onClick={() =>
                        handlePlayDoubleAction(
                          previewCard
                            .gameCardId
                        )
                      }
                    >
                      {
                        doubleActionLoading &&
                          doubleActionPlayingCardId ===
                          previewCard.gameCardId
                          ? "🎭 Активуємо..."
                          : "🎭 Зіграти"
                      }
                    </button>


                    {doubleActionError && (

                      <p
                        className={
                          style.battleError
                        }
                      >
                        {doubleActionError}
                      </p>

                    )}

                  </>

                )}


              {/* PACT WITH DEVIL / УГОДА З ДИЯВОЛОМ */}


              {previewCard.id ===
                "pact-devil" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <>

                    <button
                      type="button"
                      className={
                        style.attackButton
                      }
                      disabled={
                        pactLoading ||
                        myTreasureCount <= 0
                      }
                      onClick={() =>
                        openPactDevil(
                          previewCard
                            .gameCardId
                        )
                      }
                    >
                      {
                        pactLoading
                          ? "😈 Перевіряємо..."
                          : myTreasureCount <= 0
                            ? "😈 Потрібен хоча б 1 скарб"
                            : "😈 Зіграти"
                      }
                    </button>


                    {pactError && (

                      <p
                        className={
                          style.battleError
                        }
                      >
                        {pactError}
                      </p>

                    )}

                  </>

                )}


              {/* TRADING WINDS / ТОРГОВЕЛЬНІ ВІТРИ */}


              {previewCard.id ===
                "winds" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <>

                    <button
                      type="button"
                      className={
                        style.attackButton
                      }
                      disabled={
                        windsLoading ||
                        windsOwnTreasures.length < 1 ||
                        windsOpponentTreasures.length < 1
                      }
                      onClick={() =>
                        openWinds(
                          previewCard.gameCardId
                        )
                      }
                    >
                      {
                        windsLoading
                          ? "🌬️ Готуємо обмін..."
                          : windsOwnTreasures.length < 1
                            ? "🌬️ Потрібен свій скарб"
                            : windsOpponentTreasures.length < 1
                              ? "🌬️ Немає чужих скарбів"
                              : "🌬️ Зіграти"
                      }
                    </button>

                    {windsError && (
                      <p className={style.battleError}>
                        {windsError}
                      </p>
                    )}

                  </>

                )}


              {/* SILK TRADE / ОБМІН ШОВКОМ */}


              {previewCard.id ===
                "silk-trade" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <>

                    <button
                      type="button"
                      className={
                        style.attackButton
                      }
                      disabled={
                        silkTradeLoading ||
                        silkTradeOwnTreasures.length < 2 ||
                        silkTradeOpponentTreasures.length < 2
                      }
                      onClick={() =>
                        openSilkTrade(
                          previewCard
                            .gameCardId
                        )
                      }
                    >
                      {
                        silkTradeLoading
                          ? "🧵 Готуємо обмін..."
                          : silkTradeOwnTreasures.length < 2
                            ? "🧵 Потрібно 2 свої скарби"
                            : silkTradeOpponentTreasures.length < 2
                              ? "🧵 Потрібно 2 чужі скарби"
                              : "🧵 Зіграти"
                      }
                    </button>


                    {silkTradeError && (

                      <p
                        className={
                          style.battleError
                        }
                      >
                        {silkTradeError}
                      </p>

                    )}

                  </>

                )}


              {/* TROUBLE / КРИВАВА БИТВА */}


              {previewCard.id ===
                "trouble" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <>

                    <button
                      type="button"
                      className={
                        style.attackButton
                      }
                      disabled={
                        troubleLoading ||
                        myTreasureCount <= 0 ||
                        troubleAttackCards.length <= 0
                      }
                      onClick={() =>
                        openTrouble(
                          previewCard
                            .gameCardId
                        )
                      }
                    >
                      {
                        troubleLoading
                          ? "🩸 Готуємо битву..."
                          : myTreasureCount <= 0
                            ? "🩸 Потрібен хоча б 1 скарб"
                            : troubleAttackCards.length <= 0
                              ? "🩸 Немає бойової карти"
                              : "🩸 Зіграти"
                      }
                    </button>


                    {troubleError && (

                      <p
                        className={
                          style.battleError
                        }
                      >
                        {troubleError}
                      </p>

                    )}

                  </>

                )}


              {/* STATUE / ВЕЛИЧЕЗНА СТАТУЯ */}


              {previewCard.id ===
                "statue" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <>

                    <button
                      type="button"
                      className={
                        style.attackButton
                      }
                      disabled={
                        statueLoading ||
                        Boolean(myStatue)
                      }
                      onClick={() =>
                        handlePlayStatue(
                          previewCard.gameCardId
                        )
                      }
                    >
                      {
                        statueLoading &&
                          statuePlayingCardId ===
                          previewCard.gameCardId
                          ? "🗿 Встановлюємо..."
                          : myStatue
                            ? "🗿 Статуя вже активна"
                            : "🗿 Зіграти"
                      }
                    </button>

                    {statueError && (
                      <p
                        className={
                          style.battleError
                        }
                      >
                        {statueError}
                      </p>
                    )}

                  </>

                )}


              {/* FORTRESS / ОБОРОННА ФОРТЕЦЯ */}


              {previewCard.id ===
                "fortress" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <>

                    <button
                      type="button"

                      className={
                        style.attackButton
                      }

                      disabled={
                        fortressLoading ||
                        Boolean(myFortress)
                      }

                      onClick={() =>
                        handlePlayFortress(
                          previewCard
                            .gameCardId
                        )
                      }
                    >
                      {
                        fortressLoading &&
                          fortressPlayingCardId ===
                          previewCard.gameCardId
                          ? "🏰 Встановлюємо..."
                          : myFortress
                            ? "🏰 Фортеця вже активна"
                            : "🏰 Зіграти"
                      }
                    </button>


                    {fortressError && (

                      <p
                        className={
                          style.battleError
                        }
                      >
                        {fortressError}
                      </p>

                    )}

                  </>

                )}


              {/* VILENCIA / МІСЯЦЬ НАД ВАЛЕНСІЄЮ */}


              {previewCard.id ===
                "vilencia" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <>
                    <button
                      type="button"

                      className={
                        style.attackButton
                      }

                      disabled={
                        vilenciaLoading
                      }

                      onClick={() =>
                        handlePlayVilencia(
                          previewCard
                            .gameCardId
                        )
                      }
                    >
                      {
                        vilenciaLoading &&
                          vilenciaPlayingCardId ===
                          previewCard.gameCardId
                          ? "🌙 Розігруємо..."
                          : "🌙 Зіграти"
                      }
                    </button>


                    {vilenciaError && (

                      <p
                        className={
                          style.battleError
                        }
                      >
                        {vilenciaError}
                      </p>

                    )}
                  </>

                )}


              {/* BAZAAR */}


              {previewCard.id ===
                "bazaar" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <button
                    type="button"

                    className={
                      style.attackButton
                    }

                    disabled={
                      bazaarLoading
                    }

                    onClick={() =>
                      handleStartBazaar(
                        previewCard
                          .gameCardId
                      )
                    }
                  >
                    {
                      bazaarLoading &&
                        bazaarStartingCardId ===
                        previewCard.gameCardId
                        ? "Відкриваємо Базар..."
                        : "🏪 Зіграти"
                    }
                  </button>

                )}


              {/* TEMPORARY TREASURE */}


              {[
                "ceremonial-comb",
                "festive-duet",
                "holy-grail",
                "medieval-masterpiece",
                "phantom-swimming",
                "stinky-sandals",
              ].includes(
                previewCard.id
              ) &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <>

                    <button
                      type="button"

                      className={
                        style.attackButton
                      }

                      disabled={
                        temporaryTreasureLoading
                      }

                      onClick={() =>
                        handlePlayTemporaryTreasure(
                          previewCard
                            .gameCardId
                        )
                      }
                    >
                      {
                        temporaryTreasureLoading &&
                          temporaryTreasurePlayingCardId ===
                          previewCard.gameCardId

                          ? "💎 Використовуємо..."

                          : previewCard.id ===
                            "festive-duet"

                            ? "💎 Скинути · взяти карти + додатковий хід"

                            : "💎 Скинути та взяти карти"
                      }
                    </button>


                    {temporaryTreasureError && (

                      <p
                        className={
                          style.battleError
                        }
                      >
                        {
                          temporaryTreasureError
                        }
                      </p>

                    )}

                  </>

                )}


              {/* ATTACK */}


              {previewCard.gameCardId &&

                canAttackWithBattleCard(
                  previewCard
                ) &&

                canPlayTurn && (

                  <button
                    type="button"

                    className={
                      style.attackButton
                    }

                    onClick={() => {

                      beginAttack(
                        previewCard
                          .gameCardId
                      );

                      setPreviewCard(
                        null
                      );

                    }}
                  >
                    {previewCard.id === "group"
                      ? "⚔ Атакувати — 4"
                      : "⚔ Атакувати"}
                  </button>

                )}


              {/* GROUP / ГУРТ — ВІДКРИТА АТАКА */}


              {previewCard.id ===
                "group" &&

                previewCard.gameCardId &&

                canPlayTurn && (

                  <button
                    type="button"

                    className={
                      style.attackButton
                    }

                    onClick={() => {

                      beginAttack(
                        previewCard
                          .gameCardId,
                        "group_open"
                      );

                      setPreviewCard(
                        null
                      );

                    }}
                  >
                    🎺 Відкрита атака — 5
                  </button>

                )}


              {previewCard.type ===
                "battle" &&

                !canAttackWithBattleCard(
                  previewCard
                ) && (

                  <small
                    className={
                      style.previewHint
                    }
                  >
                    Особливий ефект цієї
                    карти реалізуємо
                    окремо.
                  </small>

                )}


              <p
                className={
                  style.previewHint
                }
              >
                Натисни на пусте місце,
                щоб закрити карту
              </p>

            </div>

          </div>

        </div>

      )}


      {/* ================================= */}
      {/* SQUIB / ПЕТАРДА — ATTACKER DECISION */}
      {/* ================================= */}


      {activeBattle &&
        iAmAttacker &&
        gamePhase ===
        "battle_attacker_reaction" && (

          <div
            className={
              style.battleOverlay
            }
          >

            <div
              className={
                style.defenseModal
              }
            >

              <h2>🧨 Петарда</h2>

              <p>
                Ти щойно оголосив битву.
                Можеш зіграти «Петарду»,
                щоб скинути до 2 випадкових
                карт з руки суперника перед
                тим, як він обере захист.
              </p>


              {squibCard ? (

                <div
                  style={{
                    margin: "16px auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >

                  <img
                    src={
                      getCardImageUrl(
                        squibCard
                          .card
                          ?.image_path
                      )
                    }
                    alt={
                      squibCard
                        .card
                        ?.name ??
                      "Петарда"
                    }
                    style={{
                      width: "130px",
                      maxWidth: "40vw",
                      borderRadius: "9px",
                    }}
                  />

                  <strong>
                    ⚡ Петарда · сила 1
                  </strong>

                </div>

              ) : (

                <p
                  className={
                    style.battleError
                  }
                >
                  Петарду не знайдено в руці.
                </p>

              )}


              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "10px",
                  marginTop: "16px",
                }}
              >

                {canPlaySquib &&
                  squibCard && (

                    <button
                      type="button"
                      className={
                        style.attackButton
                      }
                      disabled={
                        squibLoading
                      }
                      onClick={
                        handlePlaySquib
                      }
                    >
                      {
                        squibLoading &&
                          squibPlayingCardId ===
                          squibCard.id
                          ? "🧨 Розігруємо..."
                          : "🧨 Зіграти Петарду"
                      }
                    </button>

                  )}


                <button
                  type="button"
                  className={
                    style.cancelAttackButton
                  }
                  disabled={
                    squibLoading
                  }
                  onClick={
                    handlePassSquib
                  }
                >
                  Продовжити без Петарди
                </button>

              </div>


              {squibError && (

                <p
                  className={
                    style.battleError
                  }
                >
                  {squibError}
                </p>

              )}

            </div>

          </div>

        )}


      {activeBattle &&
        iAmDefender &&
        gamePhase ===
        "battle_attacker_reaction" && (

          <div
            className={
              style.waitingBattle
            }
          >
            🧨 Атакуючий вирішує,
            чи зіграти Петарду...
          </div>

        )}


      {/* ================================= */}
      {/* ATTACKER WAITING */}
      {/* ================================= */}


      {activeBattle &&
        iAmAttacker &&
        gamePhase ===
        "battle_waiting_defense" && (

          <div
            className={
              style.waitingBattle
            }
          >

            ⚔ Очікуємо рішення
            суперника...

          </div>

        )}


      {/* ================================= */}
      {/* DEFENDER WINDOW */}
      {/* ================================= */}


      {activeBattle &&
        iAmDefender &&
        gamePhase ===
        "battle_waiting_defense" && (

          <div className={style.battleOverlay}>

            <div className={style.defenseModal}>

              <h2>⚔ На тебе напали!</h2>

              <p>
                Суперник намагається
                забрати твій скарб.
              </p>


              {spyReveal?.active && (

                <div
                  style={{
                    margin: "16px auto 22px",
                    padding: "16px",
                    maxWidth: "560px",
                    border: "1px solid rgba(255,255,255,.22)",
                    borderRadius: "14px",
                    background: "rgba(0,0,0,.28)",
                  }}
                >

                  <strong
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      textAlign: "center",
                    }}
                  >
                    🕵 Шпигун розкрив атаку
                  </strong>

                  <p
                    style={{
                      margin: "0 0 14px",
                      opacity: 0.8,
                      textAlign: "center",
                    }}
                  >
                    Тепер обери, чи будеш
                    захищатися. Ці карти
                    бачиш тільки ти.
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(115px, 1fr))",
                      gap: "12px",
                    }}
                  >

                    {(
                      Array.isArray(
                        spyReveal.cards
                      )
                        ? spyReveal.cards
                        : []
                    ).map(
                      (card, index) => (

                        <div
                          key={
                            card.game_card_id ??
                            `${card.id}-${index}`
                          }
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "6px",
                            padding: "9px",
                            borderRadius: "11px",
                            background: "rgba(255,255,255,.06)",
                          }}
                        >

                          <small
                            style={{
                              opacity: 0.72,
                            }}
                          >
                            {index === 0
                              ? "Основна карта"
                              : "Підтримка"}
                          </small>

                          <img
                            src={
                              getCardImageUrl(
                                card.image_path
                              )
                            }
                            alt={card.name}
                            style={{
                              width: "110px",
                              maxWidth: "100%",
                              borderRadius: "8px",
                              boxShadow: "0 8px 20px rgba(0,0,0,.38)",
                            }}
                          />

                          <strong
                            style={{
                              fontSize: "13px",
                              textAlign: "center",
                            }}
                          >
                            {card.name}
                          </strong>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}


              {canPlaySpy &&
                spyCard &&
                !spyReveal?.active && (

                  <div
                    style={{
                      margin: "16px auto 22px",
                      padding: "14px",
                      maxWidth: "420px",
                      border: "1px solid rgba(255,255,255,.16)",
                      borderRadius: "14px",
                      background: "rgba(0,0,0,.2)",
                      textAlign: "center",
                    }}
                  >

                    <p
                      style={{
                        margin: "0 0 10px",
                        opacity: 0.82,
                      }}
                    >
                      Перед вибором захисту
                      можеш зіграти «Шпигуна»
                      та побачити карти атаки.
                    </p>

                    <button
                      type="button"
                      className={
                        style.attackButton
                      }
                      disabled={
                        spyLoading
                      }
                      onClick={
                        handlePlaySpy
                      }
                    >
                      {
                        spyLoading &&
                          spyPlayingCardId ===
                          spyCard.id
                          ? "🕵 Розігруємо..."
                          : "🕵 Зіграти Шпигуна"
                      }
                    </button>

                  </div>

                )}


              {spyError && (

                <p
                  className={
                    style.battleError
                  }
                >
                  {spyError}
                </p>

              )}


              {!spyReveal?.active &&
                openAttackCard && (

                  <div
                    style={{
                      margin: "16px auto 22px",
                      padding: "14px",
                      maxWidth: "310px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      border: "1px solid rgba(244, 204, 84, 0.45)",
                      borderRadius: "14px",
                      background: "rgba(0, 0, 0, 0.22)",
                    }}
                  >

                    <strong>
                      🎺 Відкрита карта атаки
                    </strong>

                    <img
                      src={
                        getCardImageUrl(
                          openAttackCard.image_path
                        )
                      }
                      alt={
                        openAttackCard.name
                      }
                      style={{
                        width: "120px",
                        maxWidth: "38vw",
                        borderRadius: "9px",
                        boxShadow: "0 10px 24px rgba(0, 0, 0, 0.45)",
                      }}
                    />

                    <strong>
                      {openAttackCard.name}
                    </strong>

                    <span>
                      ⚔ {openAttackCard.attack ?? 5}
                    </span>

                    <small
                      style={{
                        opacity: 0.72,
                        textAlign: "center",
                      }}
                    >
                      Карти підтримки атакуючого
                      залишаються прихованими
                      до завершення бою.
                    </small>

                  </div>

                )}


              <h3>
                1. Обери основну карту захисту
              </h3>

              {defenseCards.length > 0 ? (

                <div className={style.defenseCards}>

                  {defenseCards.map(
                    gameCard => {

                      const selected =
                        selectedDefenseCardId ===
                        gameCard.id;

                      return (

                        <button
                          type="button"
                          key={gameCard.id}
                          disabled={battleLoading}
                          className={
                            selected
                              ? style.defenseCardSelected
                              : ""
                          }
                          onClick={() => {
                            setSelectedDefenseCardId(
                              current =>
                                current === gameCard.id
                                  ? null
                                  : gameCard.id
                            );
                            setDefenseSupportCardIds([]);
                          }}
                        >

                          <img
                            src={getCardImageUrl(
                              gameCard.card?.image_path
                            )}
                            alt={gameCard.card?.name}
                          />

                          <span>
                            🛡 {
                              isDynamicBattleCard(
                                gameCard.card
                              )
                                ? "?"
                                : gameCard.card?.defense
                            }
                          </span>

                        </button>

                      );
                    }
                  )}

                </div>

              ) : (

                <p>
                  У тебе немає доступної
                  карти захисту.
                </p>

              )}


              {selectedDefenseCardId &&
                defenseSupportCards.length > 0 && (

                  <>
                    <h3>
                      2. Додай підтримку
                      (необов'язково)
                    </h3>

                    <div
                      className={
                        style.defenseSupportCards
                      }
                    >

                      {defenseSupportCards.map(
                        gameCard => {

                          const selected =
                            defenseSupportCardIds
                              .includes(gameCard.id);

                          return (

                            <button
                              type="button"
                              key={gameCard.id}
                              disabled={battleLoading}
                              className={`
                              ${style.supportCard}
                              ${selected
                                  ? style.supportCardSelected
                                  : ""
                                }
                            `}
                              onClick={() =>
                                toggleDefenseSupport(
                                  gameCard.id
                                )
                              }
                            >

                              <img
                                src={getCardImageUrl(
                                  gameCard.card?.image_path
                                )}
                                alt={gameCard.card?.name}
                              />

                              <span>
                                🛡 +{
                                  getDefenseSupportValue(
                                    gameCard.card
                                  )
                                }
                              </span>

                            </button>

                          );
                        }
                      )}

                    </div>
                  </>

                )}


              {selectedDefenseCardId && (

                <button
                  type="button"
                  className={style.confirmDefenseButton}
                  disabled={battleLoading}
                  onClick={() =>
                    handleBattleResponse(
                      selectedDefenseCardId,
                      defenseSupportCardIds
                    )
                  }
                >
                  {battleLoading
                    ? "Захищаємося..."
                    : defenseSupportBonus > 0
                      ? `🛡 Захиститися · підтримка +${defenseSupportBonus}`
                      : "🛡 Захиститися"}
                </button>

              )}


              <button
                type="button"
                className={style.noDefenseButton}
                disabled={battleLoading}
                onClick={() =>
                  handleBattleResponse(null, [])
                }
              >
                {battleLoading
                  ? "Очікуємо..."
                  : "Подарувати"}
              </button>


              {battleError && (
                <p className={style.battleError}>
                  {battleError}
                </p>
              )}

            </div>

          </div>

        )}


      {battleResult &&
        !battleGuardChoice?.active && (

          <div
            className={
              style.battleResultOverlay
            }
          >

            <div
              className={
                style.battleRevealModal
              }
            >

              <div
                className={
                  style.battleRevealHeader
                }
              >

                {battleCardsRevealed
                  ? (
                    battleResult.result ===
                      "attacker"

                      ? "⚔ АТАКА ПЕРЕМОГЛА"

                      : "🛡 ЗАХИСТ ПЕРЕМІГ"
                  )
                  : "⚔ РОЗКРИВАЄМО КАРТИ..."}

              </div>


              {/* ======================= */}
              {/* CARDS */}
              {/* ======================= */}


              <div
                className={
                  style.battleRevealCards
                }
              >


                {/* ATTACKER */}


                <div
                  className={
                    style.battleRevealSide
                  }
                >

                  <span
                    className={
                      style.battleRole
                    }
                  >
                    АТАКА
                  </span>


                  <strong>
                    {getPlayerName(
                      battleResult
                        .attacker_id
                    )}
                  </strong>


                  <div
                    className={
                      style.flipCard
                    }
                  >

                    <div
                      className={`
                                ${style.flipCardInner}

                                ${battleCardsRevealed
                          ? style.flipCardRevealed
                          : ""
                        }
                            `}
                    >

                      <div
                        className={
                          style.flipCardBack
                        }
                      >

                        <img
                          src={
                            getCardImageUrl(
                              CARD_BACK_PATH
                            )
                          }

                          alt=""
                        />

                      </div>


                      <div
                        className={
                          style.flipCardFront
                        }
                      >

                        <img
                          src={
                            getCardImageUrl(
                              battleResult
                                .attacker_card
                                ?.image_path
                            )
                          }

                          alt={
                            battleResult
                              .attacker_card
                              ?.name
                          }
                        />

                      </div>

                    </div>

                  </div>


                  {battleCardsRevealed && (

                    <div
                      className={
                        style.revealPower
                      }
                    >

                      ⚔ {
                        battleResult
                          .attack_base
                      }

                      {(battleResult.attack_bonus ?? 0) > 0 && (
                        <>
                          {" + "}{battleResult.attack_bonus}
                        </>
                      )}

                      {(battleResult.attack_support_bonus ?? 0) > 0 && (
                        <>
                          {" + "}{battleResult.attack_support_bonus}
                          {" підтримка"}
                        </>
                      )}

                      {((battleResult.attack_bonus ?? 0) +
                        (battleResult.attack_support_bonus ?? 0)) > 0 && (
                          <>
                            {" = "}{battleResult.attack_value}
                          </>
                        )}

                    </div>

                  )}

                </div>


                {/* VS */}


                <div
                  className={
                    style.revealVs
                  }
                >
                  VS
                </div>


                {/* DEFENDER */}


                <div
                  className={
                    style.battleRevealSide
                  }
                >

                  <span
                    className={
                      style.battleRole
                    }
                  >
                    ЗАХИСТ
                  </span>


                  <strong>
                    {getPlayerName(
                      battleResult
                        .defender_id
                    )}
                  </strong>


                  {battleResult
                    .defender_card ? (

                    <div
                      className={
                        style.flipCard
                      }
                    >

                      <div
                        className={`
                                    ${style.flipCardInner}

                                    ${battleCardsRevealed
                            ? style.flipCardRevealed
                            : ""
                          }
                                `}
                      >

                        <div
                          className={
                            style.flipCardBack
                          }
                        >

                          <img
                            src={
                              getCardImageUrl(
                                CARD_BACK_PATH
                              )
                            }

                            alt=""
                          />

                        </div>


                        <div
                          className={
                            style.flipCardFront
                          }
                        >

                          <img
                            src={
                              getCardImageUrl(
                                battleResult
                                  .defender_card
                                  ?.image_path
                              )
                            }

                            alt={
                              battleResult
                                .defender_card
                                ?.name
                            }
                          />

                        </div>

                      </div>

                    </div>

                  ) : (

                    <div
                      className={
                        style.noDefenseCard
                      }
                    >
                      🏳
                      <span>
                        Без захисту
                      </span>
                    </div>

                  )}


                  {battleCardsRevealed &&
                    battleResult
                      .defense_value !==
                    null && (

                      <div
                        className={
                          style.revealPower
                        }
                      >

                        🛡 {
                          battleResult
                            .defense_base
                        }

                        {(battleResult.defense_bonus ?? 0) > 0 && (
                          <>
                            {" + "}{battleResult.defense_bonus}
                          </>
                        )}

                        {(battleResult.defense_support_bonus ?? 0) > 0 && (
                          <>
                            {" + "}{battleResult.defense_support_bonus}
                            {" підтримка"}
                          </>
                        )}

                        {((battleResult.defense_bonus ?? 0) +
                          (battleResult.defense_support_bonus ?? 0)) > 0 && (
                            <>
                              {" = "}{battleResult.defense_value}
                            </>
                          )}

                      </div>

                    )}

                </div>

              </div>


              {/* ======================= */}
              {/* EQUATION */}
              {/* ======================= */}


              {battleCardsRevealed && (

                <>

                  <div
                    className={
                      style.battleEquation
                    }
                  >

                    {battleResult
                      .defense_value !==
                      null ? (

                      <>

                        <strong>
                          ⚔ {
                            battleResult
                              .attack_value
                          }
                        </strong>


                        <span>
                          {
                            battleResult
                              .attack_value >
                              battleResult
                                .defense_value

                              ? " > "

                              : " ≤ "
                          }
                        </span>


                        <strong>
                          🛡 {
                            battleResult
                              .defense_value
                          }
                        </strong>

                      </>

                    ) : (

                      <span>
                        Захисник відмовився
                        від захисту
                      </span>

                    )}

                  </div>


                  {/* ======================= */}
                  {/* TREASURE */}
                  {/* ======================= */}


                  {battleResult
                    .target_card && (

                      <div
                        className={
                          style.battleTreasureResult
                        }
                      >

                        <span>
                          Скарб
                        </span>


                        <img
                          src={
                            getCardImageUrl(
                              battleResult
                                .target_card
                                ?.image_path
                            )
                          }

                          alt={
                            battleResult
                              .target_card
                              ?.name
                          }
                        />


                        <strong>
                          {
                            battleResult
                              .target_card
                              ?.name
                          }
                        </strong>

                      </div>

                    )}


                  {/* ======================= */}
                  {/* WINNER */}
                  {/* ======================= */}


                  <div
                    className={
                      style.battleWinner
                    }
                  >

                    <span>
                      Переможець
                    </span>


                    <strong>
                      {getPlayerName(
                        battleResult
                          .winner_id
                      )}
                    </strong>

                  </div>


                  <p
                    className={
                      style.battleResultText
                    }
                  >

                    {Number(
                      battleResult
                        .trouble_transfer_count ??
                      0
                    ) > 0

                      ? `🩸 Кривава битва: ${getPlayerName(
                        battleResult.winner_id
                      )} отримує всі скарби переможеного (${Number(
                        battleResult
                          .trouble_transfer_count ??
                        0
                      )}).`

                      : battleResult.result ===
                        "attacker"

                        ? battleResult
                          .statue_destroyed
                          ? "🗿 Атакуючий переміг, але скарб захищено. Величезну статую скинуто."
                          : battleResult
                            .fortress_destroyed
                            ? "🏰 Атакуючий переміг, але скарб захищено. Оборонну фортецю скинуто."
                            : battleResult
                              .treasure_stolen
                              ? "Скарб переходить атакуючому."
                              : "Атакуючий переміг, але скарб не було вкрадено."

                        : "Скарб залишається у захисника."}

                  </p>


                  {battleCardsRevealed &&
                    battleResult
                      .trouble_card_id && (

                      <div
                        className={
                          style.battleSpecialEffect
                        }
                      >
                        🩸

                        <strong>
                          Кривава битва
                        </strong>

                        <span>
                          Передано всі скарби
                          переможеного: {
                            Number(
                              battleResult
                                .trouble_transfer_count ??
                              0
                            )
                          }.
                        </span>
                      </div>

                    )}


                  {battleCardsRevealed &&
                    battleResult
                      .fortress_destroyed && (

                      <div
                        className={
                          style.battleSpecialEffect
                        }
                      >
                        🏰

                        <strong>
                          Оборонна фортеця
                        </strong>

                        <span>
                          зупинила крадіжку скарбу
                          та була скинута.
                        </span>
                      </div>

                    )}


                  {battleCardsRevealed &&
                    battleResult
                      .statue_destroyed && (

                      <div
                        className={
                          style.battleSpecialEffect
                        }
                      >
                        🗿

                        <strong>
                          Величезна статуя
                        </strong>

                        <span>
                          зупинила крадіжку скарбу
                          після виграної битви
                          та була скинута.
                        </span>
                      </div>

                    )}


                  {battleCardsRevealed &&
                    (
                      battleResult.attacker_returned ||
                      battleResult.defender_returned
                    ) && (

                      <div
                        className={
                          style.battleSpecialEffect
                        }
                      >
                        ♻️

                        <strong>
                          {
                            battleResult
                              .attacker_returned

                              ? battleResult
                                .attacker_card
                                ?.name

                              : battleResult
                                .defender_card
                                ?.name
                          }
                        </strong>

                        <span>
                          перемагає та повертається
                          в руку!
                        </span>
                      </div>

                    )}


                  {battleCardsRevealed &&
                    bonusTreasurePending && (

                      <div
                        className={
                          style.bonusTreasureEffect
                        }
                      >

                        <h3>
                          👑 Ефект карти:
                          обери ще один скарб
                        </h3>


                        {iChooseBonusTreasure
                          ? (

                            <>
                              <p>
                                Обери один із
                                скарбів цього
                                суперника.
                              </p>


                              <div
                                className={
                                  style.bonusTreasureGrid
                                }
                              >

                                {bonusTreasureOptions
                                  .map(
                                    treasure => (

                                      <button
                                        key={
                                          treasure.id
                                        }

                                        type="button"

                                        className={
                                          style.bonusTreasureCard
                                        }

                                        disabled={
                                          bonusTreasureLoading
                                        }

                                        onClick={() =>
                                          handleClaimBonusTreasure(
                                            treasure.id
                                          )
                                        }
                                      >

                                        <img
                                          src={
                                            getCardImageUrl(
                                              treasure
                                                .card
                                                ?.image_path
                                            )
                                          }

                                          alt={
                                            treasure
                                              .card
                                              ?.name
                                          }
                                        />

                                        <span>
                                          {
                                            treasure
                                              .card
                                              ?.name
                                          }
                                        </span>

                                      </button>

                                    )
                                  )}

                              </div>


                              {bonusTreasureLoading && (

                                <p
                                  className={
                                    style.bonusTreasureStatus
                                  }
                                >
                                  Забираємо скарб...
                                </p>

                              )}


                              {bonusTreasureError && (

                                <p
                                  className={
                                    style.battleError
                                  }
                                >
                                  {
                                    bonusTreasureError
                                  }
                                </p>

                              )}
                            </>

                          )
                          : (

                            <p
                              className={
                                style.bonusTreasureStatus
                              }
                            >
                              Атакуючий обирає
                              додатковий скарб...
                            </p>

                          )}

                      </div>

                    )}


                  {battleCardsRevealed &&
                    !bonusTreasurePending &&
                    battleResult
                      .bonus_treasure && (

                      <div
                        className={
                          style.bonusTreasureTaken
                        }
                      >

                        <span>
                          Додатковий скарб
                        </span>

                        <img
                          src={
                            getCardImageUrl(
                              battleResult
                                .bonus_treasure
                                ?.image_path
                            )
                          }

                          alt={
                            battleResult
                              .bonus_treasure
                              ?.name
                          }
                        />

                        <strong>
                          {
                            battleResult
                              .bonus_treasure
                              ?.name
                          }
                        </strong>

                      </div>

                    )}


                  {!bonusTreasurePending && (

                    <button
                      type="button"

                      className={
                        style.battleContinueButton
                      }

                      onClick={() =>
                        setBattleResult(
                          null
                        )
                      }
                    >
                      Продовжити
                    </button>

                  )}

                </>

              )}

            </div>

          </div>

        )}



    </>

  );
};
