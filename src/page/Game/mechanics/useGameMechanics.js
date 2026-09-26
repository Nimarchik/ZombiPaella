import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
} from "../../../services/gameService.js";

import {
  supabase,
} from "../../../services/supabase";



import {
  getCardImageUrl,
} from "../../../services/cardService";

import {
  CARD_BACK_PATH,
} from "../constants/cards";

import style from "../../../styles/index.module.css";

import { useRiskyDilemmaMechanics } from "./cards/RiskyDilemma";
import { useBatMechanics } from "./cards/Bat";
import { useVilenciaMechanics } from "./cards/Vilencia";
import { useChickenMechanics } from "./cards/Chicken";
import { useElfMechanics } from "./cards/Elf";
import { useElixirMechanics } from "./cards/Elixir";
import { useTemporaryTreasuresMechanics } from "./cards/TemporaryTreasures";
import { useRiceMechanics } from "./cards/Rice";
import { useMajorFloodMechanics } from "./cards/MajorFlood";
import { useSpyMechanics } from "./cards/Spy";
import { useSquibMechanics } from "./cards/Squib";
import { useFortressMechanics } from "./cards/Fortress";
import { useStatueMechanics } from "./cards/Statue";
import { useTroubleMechanics } from "./cards/Trouble";
import { usePactDevilMechanics } from "./cards/PactDevil";
import { useWindsMechanics } from "./cards/Winds";
import { useSilkTradeMechanics } from "./cards/SilkTrade";
import { useDoubleActionMechanics } from "./cards/DoubleAction";
import { useBattleGuardChoiceMechanics } from "./cards/BattleGuardChoice";
import { useReactionsMechanics } from "./cards/Reactions";
import { useBazaarMechanics } from "./cards/Bazaar";



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
  // CROSS-MODULE RUNTIME BRIDGE
  // =========================================================

  const runtime = useRef({});

  const runtimeFns = useMemo(
    () => ({
      loadSpyReveal: (...args) =>
        runtime.current.loadSpyReveal?.(...args),

      loadBattleResult: (...args) =>
        runtime.current.loadBattleResult?.(...args),

      setSpyReveal: (...args) =>
        runtime.current.setSpyReveal?.(...args),
    }),
    []
  );


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

  // =========================================================
  // MODULAR CARD MECHANICS
  // =========================================================

  const fortressMechanics =
    useFortressMechanics(
      {
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
          runtimeFns,
        
        }
    );

  const {
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
    handlePlayFortress
  } = fortressMechanics;

  const statueMechanics =
    useStatueMechanics(
      {
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
          runtimeFns,
        
        }
    );

  const {
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
    handlePlayStatue
  } = statueMechanics;

  const battleGuardMechanics =
    useBattleGuardChoiceMechanics(
      {
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
          runtimeFns,
          loadFortresses: loadFortresses,
          loadStatues: loadStatues
        }
    );

  const {
    battleGuardChoice,
    setBattleGuardChoice,
    battleGuardChoiceLoading,
    setBattleGuardChoiceLoading,
    battleGuardChoiceError,
    setBattleGuardChoiceError,
    loadBattleGuardChoice,
    handleChooseBattleGuard
  } = battleGuardMechanics;

  const reactionMechanics =
    useReactionsMechanics(
      {
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
          runtimeFns,
          loadFortresses: loadFortresses,
          loadStatues: loadStatues,
          loadBattleGuardChoice: loadBattleGuardChoice,
          battleGuardMechanics: battleGuardMechanics
        }
    );

  const {
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
    loadEnergyReaction,
    handlePassBattleReaction,
    handlePlayChatter,
    handleFinalizeBattleReactions,
    ultraprotectionDiscardOptions,
    toggleUltraprotectionDiscard,
    handlePassEnergyReaction,
    handlePlayProtection,
    handlePlayUltraprotection
  } = reactionMechanics;

  const spyMechanics =
    useSpyMechanics(
      {
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
          runtimeFns,
          loadEnergyReaction: loadEnergyReaction
        }
    );

  const {
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
    handlePlaySpy
  } = spyMechanics;

  const squibMechanics =
    useSquibMechanics(
      {
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
          runtimeFns,
          loadEnergyReaction: loadEnergyReaction
        }
    );

  const {
    squibLoading,
    setSquibLoading,
    squibError,
    setSquibError,
    squibPlayingCardId,
    setSquibPlayingCardId,
    squibCard,
    canPlaySquib,
    handlePlaySquib,
    handlePassSquib
  } = squibMechanics;

  const riceMechanics =
    useRiceMechanics(
      {
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
          runtimeFns,
          loadEnergyReaction: loadEnergyReaction
        }
    );

  const {
    riceLoading,
    setRiceLoading,
    riceError,
    setRiceError,
    ricePlayingCardId,
    setRicePlayingCardId,
    myIngredientCount,
    setMyIngredientCount,
    loadMyIngredientCount,
    handlePlayRice
  } = riceMechanics;

  const majorFloodMechanics =
    useMajorFloodMechanics(
      {
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
          runtimeFns,
        
        }
    );

  const {
    majorFloodLoading,
    setMajorFloodLoading,
    majorFloodError,
    setMajorFloodError,
    majorFloodPlayingCardId,
    setMajorFloodPlayingCardId,
    handlePlayMajorFlood
  } = majorFloodMechanics;

  const doubleActionMechanics =
    useDoubleActionMechanics(
      {
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
          runtimeFns,
          loadEnergyReaction: loadEnergyReaction
        }
    );

  const {
    turnActionState,
    setTurnActionState,
    doubleActionLoading,
    setDoubleActionLoading,
    doubleActionError,
    setDoubleActionError,
    doubleActionPlayingCardId,
    setDoubleActionPlayingCardId,
    loadTurnActionState,
    handlePlayDoubleAction
  } = doubleActionMechanics;

  const temporaryTreasureMechanics =
    useTemporaryTreasuresMechanics(
      {
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
          runtimeFns,
          loadTurnActionState: loadTurnActionState,
          loadMyIngredientCount: loadMyIngredientCount
        }
    );

  const {
    temporaryTreasureLoading,
    setTemporaryTreasureLoading,
    temporaryTreasureError,
    setTemporaryTreasureError,
    temporaryTreasurePlayingCardId,
    setTemporaryTreasurePlayingCardId,
    myTemporaryTreasureIds,
    handlePlayTemporaryTreasure
  } = temporaryTreasureMechanics;

  const riskyDilemmaMechanics =
    useRiskyDilemmaMechanics(
      {
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
          runtimeFns,
        
        }
    );

  const {
    riskyDilemmaCardId,
    setRiskyDilemmaCardId,
    riskyDilemmaSelectedIds,
    setRiskyDilemmaSelectedIds,
    riskyDilemmaLoading,
    setRiskyDilemmaLoading,
    riskyDilemmaError,
    setRiskyDilemmaError,
    riskyDilemmaCards,
    toggleRiskyDilemmaCard,
    openRiskyDilemma,
    closeRiskyDilemma,
    handlePlayRiskyDilemma
  } = riskyDilemmaMechanics;

  const batMechanics =
    useBatMechanics(
      {
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
          runtimeFns,
        
        }
    );

  const {
    batCardId,
    setBatCardId,
    batSelectingTreasure,
    setBatSelectingTreasure,
    batTarget,
    setBatTarget,
    batLoading,
    setBatLoading,
    batError,
    setBatError,
    openBat,
    closeBat,
    handlePlayBat
  } = batMechanics;

  const troubleMechanics =
    useTroubleMechanics(
      {
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
          runtimeFns,
          batMechanics: batMechanics
        }
    );

  const {
    troubleCardId,
    setTroubleCardId,
    troubleLoading,
    setTroubleLoading,
    troubleError,
    setTroubleError,
    troubleAttackCards,
    myTreasureCount,
    openTrouble,
    closeTrouble,
    beginTroubleAttack
  } = troubleMechanics;

  const pactDevilMechanics =
    usePactDevilMechanics(
      {
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
          runtimeFns,
          troubleMechanics: troubleMechanics,
          loadEnergyReaction: loadEnergyReaction,
          loadTurnActionState: loadTurnActionState
        }
    );

  const {
    pactCardId,
    setPactCardId,
    pactTargets,
    setPactTargets,
    pactTargetPlayerId,
    setPactTargetPlayerId,
    pactLoading,
    setPactLoading,
    pactError,
    setPactError,
    openPactDevil,
    closePactDevil,
    handlePlayPactDevil
  } = pactDevilMechanics;

  const windsMechanics =
    useWindsMechanics(
      {
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
          runtimeFns,
          loadEnergyReaction: loadEnergyReaction,
          loadTurnActionState: loadTurnActionState
        }
    );

  const {
    windsCardId,
    setWindsCardId,
    windsMyTreasureId,
    setWindsMyTreasureId,
    windsTargetTreasureId,
    setWindsTargetTreasureId,
    windsLoading,
    setWindsLoading,
    windsError,
    setWindsError,
    windsOwnTreasures,
    windsOpponentTreasures,
    openWinds,
    closeWinds,
    handlePlayWinds
  } = windsMechanics;

  const silkTradeMechanics =
    useSilkTradeMechanics(
      {
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
          runtimeFns,
          loadEnergyReaction: loadEnergyReaction
        }
    );

  const {
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
    handlePlaySilkTrade
  } = silkTradeMechanics;

  const vilenciaMechanics =
    useVilenciaMechanics(
      {
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
          runtimeFns,
        
        }
    );

  const {
    vilenciaLoading,
    setVilenciaLoading,
    vilenciaError,
    setVilenciaError,
    vilenciaPlayingCardId,
    setVilenciaPlayingCardId,
    handlePlayVilencia
  } = vilenciaMechanics;

  const chickenMechanics =
    useChickenMechanics(
      {
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
          runtimeFns,
        
        }
    );

  const {
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
    handleResolveChicken
  } = chickenMechanics;

  const elfMechanics =
    useElfMechanics(
      {
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
          runtimeFns,
        
        }
    );

  const {
    elfSession,
    setElfSession,
    elfSelectedCardId,
    setElfSelectedCardId,
    elfLoading,
    setElfLoading,
    elfError,
    setElfError,
    loadElf,
    handleStartElf,
    handleResolveElf
  } = elfMechanics;

  const elixirMechanics =
    useElixirMechanics(
      {
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
          runtimeFns,
        
        }
    );

  const {
    elixirCardId,
    setElixirCardId,
    elixirOptions,
    setElixirOptions,
    elixirSelectedCardId,
    setElixirSelectedCardId,
    elixirLoading,
    setElixirLoading,
    elixirError,
    setElixirError,
    openElixir,
    closeElixir,
    handlePlayElixir
  } = elixirMechanics;

  const bazaarMechanics =
    useBazaarMechanics(
      {
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
          runtimeFns,
        
        }
    );

  const {
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
    handlePickBazaarCard
  } = bazaarMechanics;


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


  // Keep cyclic cross-module callbacks current without coupling hooks.
  runtime.current.loadSpyReveal =
    loadSpyReveal;

  runtime.current.setSpyReveal =
    setSpyReveal;

  runtime.current.loadBattleResult =
    loadBattleResult;


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
