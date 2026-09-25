import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  animated,
  useTransition,
} from "@react-spring/web";

import {
  getGameByRoom,
  getGamePlayers,
  getMyHand,
  getTreasures,
  getHandCounts,
  getDeckCount,
  getSaffron,
  drawCard,
  getActiveBattle,
} from "../../services/gameService";

import {
  useGameMechanics,
  GameMechanicsUI,
} from "./GameMechanics";

import {
  getCurrentUser,
} from "../../services/authService";

import {
  getCardImageUrl,
} from "../../services/cardService";

import {
  supabase,
} from "../../services/supabase";

import {
  CARD_BACK_PATH,
} from "./constants/cards";

import style from "../../styles/index.module.css";


const getOpponentPosition = (
  index,
  total
) => {
  if (total === 1) {
    return "topCenter";
  }

  if (total === 2) {
    return [
      "topLeft",
      "topRight",
    ][index];
  }

  if (total === 3) {
    return [
      "leftCenter",
      "topCenter",
      "rightCenter",
    ][index];
  }

  return [
    "leftCenter",
    "topLeft",
    "topRight",
    "rightCenter",
  ][index];
};


const Game = () => {

  const { id } = useParams();

  const navigate = useNavigate();


  // ============================================
  // STATE
  // ============================================

  const [game, setGame] =
    useState(null);

  const [players, setPlayers] =
    useState([]);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [hand, setHand] =
    useState([]);

  const [treasures, setTreasures] =
    useState([]);

  const [handCounts, setHandCounts] =
    useState([]);

  const [deckCount, setDeckCount] =
    useState(0);

  const [saffron, setSaffron] =
    useState(null);

  const [activeBattle, setActiveBattle] =
    useState(null);

  const [previewCard, setPreviewCard] =
    useState(null);

  const [almsMenuOpen, setAlmsMenuOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [drawing, setDrawing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [actionError, setActionError] =
    useState("");


  const getPlayerName =
    playerId => {

      const player =
        players.find(
          item =>
            item.player_id ===
            playerId
        );

      return (
        player?.profiles?.nickname
        ?? "Гравець"
      );
    };



  // ============================================
  // LOAD MY HAND
  // ============================================

  const loadMyHand = useCallback(
    async (
      gameId,
      userId
    ) => {

      const {
        data,
        error,
      } = await getMyHand(
        gameId,
        userId
      );

      if (error) {
        console.error(
          "HAND ERROR:",
          error
        );

        return;
      }

      setHand(
        data ?? []
      );
    },
    []
  );


  // ============================================
  // LOAD TREASURES
  // ============================================

  const loadTreasures = useCallback(
    async (gameId) => {

      const {
        data,
        error,
      } = await getTreasures(
        gameId
      );

      if (error) {
        console.error(
          "TREASURES ERROR:",
          error
        );

        return;
      }

      setTreasures(
        data ?? []
      );
    },
    []
  );


  // ============================================
  // LOAD HAND COUNTS
  // ============================================

  const loadHandCounts = useCallback(
    async (gameId) => {

      const {
        data,
        error,
      } = await getHandCounts(
        gameId
      );

      if (error) {
        console.error(
          "HAND COUNTS ERROR:",
          error
        );

        return;
      }

      setHandCounts(
        data ?? []
      );
    },
    []
  );


  // ============================================
  // LOAD DECK COUNT
  // ============================================

  const loadDeckCount = useCallback(
    async (gameId) => {

      const {
        data,
        error,
      } = await getDeckCount(
        gameId
      );

      if (error) {
        console.error(
          "DECK COUNT ERROR:",
          error
        );

        return;
      }

      setDeckCount(
        Number(data ?? 0)
      );
    },
    []
  );


  // ============================================
  // LOAD SAFFRON
  // ============================================

  const loadSaffron = useCallback(
    async (gameId) => {

      const {
        data,
        error,
      } = await getSaffron(
        gameId
      );

      if (error) {
        console.error(
          "SAFFRON ERROR:",
          error
        );

        return;
      }

      setSaffron(
        data ?? null
      );
    },
    []
  );


  // ============================================
  // LOAD ACTIVE BATTLE
  // ============================================

  const loadActiveBattle = useCallback(
    async (gameId) => {

      const {
        data,
        error,
      } = await getActiveBattle(
        gameId
      );

      if (error) {
        console.error(
          "ACTIVE BATTLE ERROR:",
          error
        );

        return;
      }

      setActiveBattle(
        data ?? null
      );
    },
    []
  );


  // ============================================
  // REFRESH TABLE
  // ============================================

  const refreshCards = useCallback(
    async (
      gameId,
      userId
    ) => {

      await Promise.all([
        loadMyHand(
          gameId,
          userId
        ),

        loadTreasures(
          gameId
        ),

        loadHandCounts(
          gameId
        ),

        loadDeckCount(
          gameId
        ),

        loadSaffron(
          gameId
        ),

        loadActiveBattle(
          gameId
        ),
      ]);
    },
    [
      loadMyHand,
      loadTreasures,
      loadHandCounts,
      loadDeckCount,
      loadSaffron,
      loadActiveBattle,
    ]
  );


  // ============================================
  // LOAD GAME STATE
  // ============================================

  const loadGameState = useCallback(
    async () => {

      const {
        data,
        error,
      } = await getGameByRoom(
        id
      );

      if (error) {
        console.error(
          "GAME STATE ERROR:",
          error
        );

        return null;
      }

      setGame(data);

      return data;
    },
    [id]
  );


  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {

    const initGame = async () => {

      setLoading(true);
      setError("");


      // USER

      const {
        user,
        error: userError,
      } =
        await getCurrentUser();


      if (
        userError ||
        !user
      ) {

        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;
      }


      setCurrentUser(
        user
      );


      // GAME

      const {
        data: gameData,
        error: gameError,
      } =
        await getGameByRoom(
          id
        );


      if (
        gameError ||
        !gameData
      ) {

        console.error(
          "GAME ERROR:",
          gameError
        );

        setError(
          "Гру не знайдено"
        );

        setLoading(false);

        return;
      }


      setGame(
        gameData
      );


      // PLAYERS

      const {
        data: playersData,
        error: playersError,
      } =
        await getGamePlayers(
          gameData.id
        );


      if (playersError) {

        console.error(
          "PLAYERS ERROR:",
          playersError
        );

        setError(
          "Не вдалося завантажити гравців"
        );

        setLoading(false);

        return;
      }


      setPlayers(
        playersData ?? []
      );


      await refreshCards(
        gameData.id,
        user.id
      );


      setLoading(false);
    };


    initGame();

  }, [
    id,
    navigate,
    refreshCards,
  ]);


  // ============================================
  // COMPUTED VALUES
  // ============================================

  const opponents =
    useMemo(() => {

      return players.filter(
        player =>
          player.player_id !==
          currentUser?.id
      );

    }, [
      players,
      currentUser?.id,
    ]);


  const isMyTurn =
    game?.current_player_id ===
    currentUser?.id;


  const canPlayTurn =
    isMyTurn &&
    game?.phase === "turn";

  const gameFinished =
    game?.status === "finished" &&
    Boolean(game?.winner_id);


  const winnerPlayer =
    useMemo(() => {

      if (!game?.winner_id) {
        return null;
      }

      return players.find(
        player =>
          player.player_id ===
          game.winner_id
      ) ?? null;

    }, [
      players,
      game?.winner_id,
    ]);


  const winnerName =
    winnerPlayer
      ?.profiles
      ?.nickname
    ?? "Гравець";


  const iWon =
    game?.winner_id ===
    currentUser?.id;


  const mechanics =
    useGameMechanics({
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
    });


  const {
    attackCardId,
    setAttackCardId,

    selectingTreasure,
    setSelectingTreasure,

    battleLoading,
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

    isDynamicBattleCard,
    canAttackWithBattleCard,

    getAttackSupportValue,
    getDefenseSupportValue,

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

    bonusTreasurePending,
    iChooseBonusTreasure,
    bonusTreasureOptions,

    bonusTreasureLoading,
    bonusTreasureError,

    handleStartBattle,
    handleBattleResponse,
    handleClaimBonusTreasure,

    beginAttack,
    cancelAttack,
    handleEnemyTreasureClick,

    riskyDilemmaCardId,
    riskyDilemmaSelectedIds,
    riskyDilemmaLoading,
    riskyDilemmaError,
    riskyDilemmaCards,

    toggleRiskyDilemmaCard,
    openRiskyDilemma,
    closeRiskyDilemma,
    handlePlayRiskyDilemma,

    batCardId,
    batSelectingTreasure,
    batTarget,
    setBatTarget,
    batLoading,
    batError,

    openBat,
    closeBat,
    handlePlayBat,
  } = mechanics;


  // ============================================
  // CLOSE ALMS MENU
  // ============================================

  useEffect(() => {

    if (!canPlayTurn) {
      setAlmsMenuOpen(false);
    }

  }, [canPlayTurn]);


  // ============================================
  // DRAW CARD
  // ============================================

  const handleDrawCard =
    async (mode) => {

      if (
        !game ||
        !currentUser ||
        drawing ||
        !canPlayTurn
      ) {
        return;
      }


      setActionError("");
      setDrawing(true);
      setAlmsMenuOpen(false);


      const {
        result,
        error,
      } =
        await drawCard(
          game.id,
          mode
        );


      if (error) {

        console.error(
          "DRAW ERROR:",
          error
        );

        setActionError(
          error.message
        );

        setDrawing(false);

        return;
      }


      console.log(
        "DRAW RESULT:",
        result
      );


      await refreshCards(
        game.id,
        currentUser.id
      );


      await loadGameState();


      setDrawing(false);
    };


  // ============================================
  // REALTIME CARDS
  // ============================================

  useEffect(() => {

    if (
      !game?.id ||
      !currentUser?.id
    ) {
      return;
    }


    const gameId =
      game.id;

    const userId =
      currentUser.id;


    const channel =
      supabase
        .channel(
          `game-cards-${gameId}`
        )

        .on(
          "postgres_changes",

          {
            event: "*",
            schema: "public",
            table: "game_cards",
            filter:
              `game_id=eq.${gameId}`,
          },

          async () => {

            await refreshCards(
              gameId,
              userId
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
    refreshCards,
  ]);


  // ============================================
  // REALTIME GAME STATE
  // ============================================

  useEffect(() => {

    if (
      !game?.id ||
      !currentUser?.id
    ) {
      return;
    }


    const gameId =
      game.id;

    const userId =
      currentUser.id;


    const channel =
      supabase
        .channel(
          `game-state-${gameId}`
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

          async (
            payload
          ) => {

            setGame(
              payload.new
            );


            await refreshCards(
              gameId,
              userId
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
    refreshCards,
  ]);


  // ============================================
  // HELPERS
  // ============================================

  const getPlayerHandCount =
    playerId => {

      if (
        playerId ===
        currentUser?.id
      ) {
        return hand.length;
      }


      const result =
        handCounts.find(
          item =>
            item.player_id ===
            playerId
        );


      return Number(
        result?.hand_count ?? 0
      );
    };


  const getPlayerTreasures =
    playerId => {

      return treasures.filter(
        treasure =>
          treasure.owner_id ===
          playerId
      );
    };


  // ============================================
  // HAND ANIMATION
  // ============================================

  const handTransitions =
    useTransition(
      hand,
      {
        keys:
          gameCard =>
            gameCard.id,

        from: {
          opacity: 0,
          transform:
            "translateY(-170px) scale(0.65)",
        },

        enter: {
          opacity: 1,
          transform:
            "translateY(0px) scale(1)",
        },

        leave: {
          opacity: 0,
          transform:
            "translateY(-100px) scale(0.7)",
        },

        trail: 45,

        config: {
          tension: 240,
          friction: 19,
        },
      }
    );


  // ============================================
  // LOADING
  // ============================================

  if (loading) {

    return (

      <div
        className={
          style.loadingScreen
        }
      >

        <div
          className={
            style.loadingPot
          }
        >
          ☠
        </div>

        <p>
          Готуємо паелью...
        </p>

      </div>
    );
  }


  // ============================================
  // ERROR
  // ============================================

  if (error) {

    return (

      <div
        className={
          style.loadingScreen
        }
      >

        <p>
          {error}
        </p>

        <button
          type="button"

          onClick={() =>
            navigate(
              "/profile"
            )
          }
        >
          В профіль
        </button>

      </div>
    );
  }


  // ============================================
  // UI
  // ============================================

  return (

    <main
      className={
        style.gameScreen
      }
    >


      {/* ================================= */}
      {/* TURN INDICATOR */}
      {/* ================================= */}


      <div
        className={`
                    ${style.turnIndicator}

                    ${isMyTurn
            ? style.myTurn
            : ""
          }
                `}
      >

        <span
          className={
            style.turnDot
          }
        />

        {bonusTreasurePending

          ? "Обирається додатковий скарб"

          : game?.phase ===
            "battle_waiting_defense"

            ? "Триває битва"

            : isMyTurn
              ? "Твій хід"
              : "Хід суперника"}

      </div>


      {/* ================================= */}
      {/* TABLE */}
      {/* ================================= */}


      <div
        className={
          style.table
        }
      >


        {/* ============================= */}
        {/* OPPONENTS */}
        {/* ============================= */}


        <div
          className={
            style.opponentsLayer
          }
        >

          {opponents.map(
            (
              player,
              index
            ) => {

              const position =
                getOpponentPosition(
                  index,
                  opponents.length
                );


              const handCount =
                getPlayerHandCount(
                  player.player_id
                );


              const playerTreasures =
                getPlayerTreasures(
                  player.player_id
                );


              const current =
                game?.current_player_id ===
                player.player_id;


              return (

                <section
                  key={
                    player.id
                  }

                  className={`
                                        ${style.opponent}

                                        ${style[
                    position
                    ]
                    }

                                        ${current
                      ? style.activePlayer
                      : ""
                    }
                                    `}
                >


                  {/* PLAYER INFO */}


                  <div
                    className={
                      style.playerInfo
                    }
                  >

                    <div
                      className={
                        style.avatar
                      }
                    >

                      {player
                        .profiles
                        ?.avatar
                        ? (

                          <img
                            src={
                              player
                                .profiles
                                .avatar
                            }

                            alt=""
                          />

                        )
                        : (

                          <span>

                            {player
                              .profiles
                              ?.nickname
                              ?.charAt(0)
                              ?.toUpperCase()}

                          </span>

                        )}

                    </div>


                    <div>

                      <div
                        className={
                          style.nickname
                        }
                      >
                        {
                          player
                            .profiles
                            ?.nickname
                        }
                      </div>


                      <div
                        className={
                          style.playerStatus
                        }
                      >

                        {current
                          ? "ходить"
                          : `${handCount} карт`}

                      </div>

                    </div>

                  </div>


                  {/* ENEMY HAND */}


                  <div
                    className={
                      style.enemyHand
                    }
                  >

                    {Array
                      .from(
                        {
                          length:
                            handCount,
                        }
                      )
                      .map(
                        (
                          _,
                          cardIndex
                        ) => (

                          <img
                            key={
                              cardIndex
                            }

                            className={
                              style.enemyCard
                            }

                            style={{
                              "--card-index":
                                cardIndex,

                              "--card-count":
                                handCount,
                            }}

                            src={
                              getCardImageUrl(
                                CARD_BACK_PATH
                              )
                            }

                            alt=""
                          />

                        )
                      )}

                  </div>


                  {/* ENEMY TREASURES */}


                  {playerTreasures.length > 0 && (

                    <div
                      className={
                        style.enemyTreasures
                      }
                    >

                      {playerTreasures.map(
                        treasure => (

                          <button
                            key={
                              treasure.id
                            }

                            type="button"

                            disabled={
                              battleLoading
                            }

                            className={`
        ${style.enemyTreasureCard}

        ${
          selectingTreasure ||
          batSelectingTreasure
            ? style.attackTarget
            : ""
        }

        ${hoveredTreasureId ===
                                treasure.id
                                ? style.attackTargetHover
                                : ""
                              }
    `}

                            onDragEnter={event => {

                              if (
                                !draggedBattleCardId
                              ) {
                                return;
                              }

                              event.preventDefault();

                              setHoveredTreasureId(
                                treasure.id
                              );
                            }}

                            onDragOver={event => {

                              if (
                                !draggedBattleCardId
                              ) {
                                return;
                              }

                              event.preventDefault();

                              event.dataTransfer.dropEffect =
                                "move";

                              setHoveredTreasureId(
                                treasure.id
                              );
                            }}

                            onDragLeave={event => {

                              if (
                                event.currentTarget.contains(
                                  event.relatedTarget
                                )
                              ) {
                                return;
                              }

                              setHoveredTreasureId(
                                current =>
                                  current === treasure.id
                                    ? null
                                    : current
                              );
                            }}

                            onDrop={event => {

                              event.preventDefault();

                              if (
                                !draggedBattleCardId
                              ) {
                                return;
                              }

                              setHoveredTreasureId(
                                null
                              );

                              handleStartBattle(
                                treasure.id
                              );
                            }}

                            onClick={() => {

                              const handled =
                                handleEnemyTreasureClick(
                                  treasure
                                );


                              if (handled) {
                                return;
                              }


                              setPreviewCard({
                                ...treasure.card,

                                gameCardId:
                                  treasure.id,

                                ownerId:
                                  treasure.owner_id,
                              });
                            }}
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
                          </button>

                        )
                      )}

                    </div>

                  )}


                </section>

              );

            }
          )}

        </div>


        {/* ============================= */}
        {/* CENTER MARK */}
        {/* ============================= */}


        <div
          className={
            style.paellaMark
          }
        >

          <div>
            ZOMBIE
          </div>

          <span>
            PAELLA
          </span>

        </div>


        {/* ============================= */}
        {/* DECK */}
        {/* ============================= */}


        <div
          className={
            style.deckArea
          }
        >

          <button
            type="button"

            className={
              style.deck
            }

            onClick={() =>
              setAlmsMenuOpen(
                previous =>
                  !previous
              )
            }

            disabled={
              !canPlayTurn ||
              drawing ||
              battleLoading ||
              deckCount <= 0
            }
          >

            <span
              className={
                style.deckShadowThree
              }
            />

            <span
              className={
                style.deckShadowTwo
              }
            />

            <span
              className={
                style.deckShadowOne
              }
            />


            <img
              src={
                getCardImageUrl(
                  CARD_BACK_PATH
                )
              }

              alt="Колода"

              className={
                style.deckImage
              }
            />


            <span
              className={
                style.deckCounter
              }
            >
              {deckCount}
            </span>

          </button>


          <span
            className={
              style.deckLabel
            }
          >

            {drawing
              ? "Беремо..."
              : canPlayTurn
                ? "Натисни на колоду"
                : "Колода"}

          </span>


          {/* SAFFRON */}


          {saffron && (

            <button
              type="button"

              className={
                style.saffronCard
              }

              onClick={() =>
                setPreviewCard({
                  ...saffron.card,

                  gameCardId:
                    saffron.id,
                })
              }
            >

              <img
                src={
                  getCardImageUrl(
                    saffron
                      .card
                      ?.image_path
                  )
                }

                alt="Шафран"
              />

              <span>
                Шафран
              </span>

            </button>

          )}


          {/* ALMS MENU */}


          {almsMenuOpen &&
            canPlayTurn && (

              <div
                className={
                  style.almsMenu
                }
              >

                <div
                  className={
                    style.almsTitle
                  }
                >
                  Милостиня
                </div>


                <button
                  type="button"

                  className={
                    style.almsButton
                  }

                  disabled={
                    drawing
                  }

                  onClick={() =>
                    handleDrawCard(
                      "one"
                    )
                  }
                >
                  Взяти 1 карту
                </button>


                <button
                  type="button"

                  className={
                    style.almsButton
                  }

                  disabled={
                    drawing ||
                    hand.length >= 3
                  }

                  onClick={() =>
                    handleDrawCard(
                      "to_three"
                    )
                  }
                >
                  Добрати до 3
                </button>


                {hand.length >= 3 && (

                  <small
                    className={
                      style.almsHint
                    }
                  >
                    У тебе вже 3+
                    карти в руці
                  </small>

                )}

              </div>

            )}

        </div>


        {/* ============================= */}
        {/* MY TREASURES */}
        {/* ============================= */}


        <section
          className={
            style.myTreasuresArea
          }
        >

          <div
            className={
              style.zoneTitle
            }
          >
            Мої скарби
          </div>


          <div
            className={
              style.myTreasures
            }
          >

            {getPlayerTreasures(
              currentUser?.id
            ).map(
              treasure => (

                <button
                  type="button"

                  key={
                    treasure.id
                  }

                  className={
                    style.treasureCard
                  }

                  onClick={() =>
                    setPreviewCard({
                      ...treasure.card,

                      gameCardId:
                        treasure.id,

                      ownerId:
                        treasure.owner_id,
                    })
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

                </button>

              )
            )}

          </div>

        </section>


        {/* ============================= */}
        {/* ME */}
        {/* ============================= */}


        <div
          className={`
                        ${style.me}

                        ${isMyTurn
              ? style.activePlayer
              : ""
            }
                    `}
        >

          <div
            className={
              style.avatar
            }
          >

            {
              currentUser
                ?.user_metadata
                ?.nickname
                ?.charAt(0)
                ?.toUpperCase()
              ?? "?"
            }

          </div>

        </div>


        {/* ============================= */}
        {/* MY HAND */}
        {/* ============================= */}


        <section
          className={
            style.handArea
          }
        >

          <div
            className={
              style.myHandTitle
            }
          >
            Моя рука · {hand.length}
          </div>


          <div
            className={
              style.hand
            }
          >

            {handTransitions(
              (
                animation,
                gameCard,
                _,
                index
              ) => {

                const center =
                  (
                    hand.length -
                    1
                  ) / 2;


                const distance =
                  index -
                  center;


                const rotation =
                  distance * 5;


                const offsetY =
                  Math.abs(
                    distance
                  ) * 5;


                return (

                  <animated.div
                    key={
                      gameCard.id
                    }

                    className={
                      style.cardAnimation
                    }

                    style={
                      animation
                    }
                  >

                    <button
                      type="button"

                      className={`
        ${style.handCard}

        ${draggedBattleCardId ===
                          gameCard.id
                          ? style.draggingBattleCard
                          : ""
                        }
    `}

                      draggable={
                        canPlayTurn &&
                        canAttackWithBattleCard(
                          gameCard.card
                        )
                      }

                      onDragStart={event => {

                        if (
                          !canPlayTurn ||
                          !canAttackWithBattleCard(
                            gameCard.card
                          )
                        ) {
                          event.preventDefault();
                          return;
                        }

                        setDraggedBattleCardId(
                          gameCard.id
                        );

                        setAttackCardId(
                          gameCard.id
                        );

                        setAttackSupportCardIds(
                          []
                        );

                        setSelectingTreasure(
                          true
                        );

                        setAlmsMenuOpen(
                          false
                        );

                        event.dataTransfer.effectAllowed =
                          "move";

                        event.dataTransfer.setData(
                          "text/plain",
                          gameCard.id
                        );
                      }}

                      onDragEnd={() => {

                        setDraggedBattleCardId(
                          null
                        );

                        setHoveredTreasureId(
                          null
                        );

                        // Если карту просто бросили
                        // где-то мимо сокровища —
                        // отменяем режим атаки.

                        setAttackCardId(
                          null
                        );

                        setAttackSupportCardIds(
                          []
                        );

                        setSelectingTreasure(
                          false
                        );
                      }}

                      style={{
                        "--rotation":
                          `${rotation}deg`,

                        "--offset-y":
                          `${offsetY}px`,

                        zIndex:
                          index + 1,
                      }}

                      onClick={() =>
                        setPreviewCard({
                          ...gameCard.card,

                          gameCardId:
                            gameCard.id,
                        })
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

                    </button>

                  </animated.div>

                );

              }
            )}

          </div>

        </section>


        {/* ============================= */}
        {/* ERRORS */}
        {/* ============================= */}


        {actionError && (

          <div
            className={
              style.actionError
            }
          >
            {actionError}
          </div>

        )}


        {battleError && (

          <div
            className={
              style.actionError
            }
          >
            {battleError}
          </div>

        )}


      </div>


      <GameMechanicsUI
        mechanics={
          mechanics
        }

        previewCard={
          previewCard
        }

        setPreviewCard={
          setPreviewCard
        }

        canPlayTurn={
          canPlayTurn
        }

        setAlmsMenuOpen={
          setAlmsMenuOpen
        }

        getPlayerName={
          getPlayerName
        }
      />


      {gameFinished &&
        !battleResult && (

          <div
            className={
              style.gameOverOverlay
            }
          >

            <div
              className={
                style.gameOverModal
              }
            >

              <div
                className={
                  style.gameOverCrown
                }
              >
                👑
              </div>


              <span
                className={
                  style.gameOverLabel
                }
              >
                ГРУ ЗАВЕРШЕНО
              </span>


              <h1>
                {iWon
                  ? "Ти переміг!"
                  : `${winnerName} переміг!`}
              </h1>


              <p
                className={
                  style.gameOverText
                }
              >

                {iWon
                  ? "Ти зібрав необхідні інгредієнти для паельї."
                  : `${winnerName} першим зібрав необхідні інгредієнти.`}

              </p>


              <div
                className={
                  style.gameOverWinner
                }
              >

                <div
                  className={
                    style.gameOverAvatar
                  }
                >

                  {winnerPlayer
                    ?.profiles
                    ?.avatar ? (

                    <img
                      src={
                        winnerPlayer
                          .profiles
                          .avatar
                      }

                      alt=""
                    />

                  ) : (

                    <span>
                      {winnerName
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </span>

                  )}

                </div>


                <strong>
                  {winnerName}
                </strong>

                <span>
                  🏆 Переможець
                </span>

              </div>


              <button
                type="button"

                className={
                  style.gameOverButton
                }

                onClick={() =>
                  navigate(
                    "/profile"
                  )
                }
              >
                Повернутися в профіль
              </button>

            </div>

          </div>

        )}

      {!battleResult}
    </main>

  );
};


export default Game;