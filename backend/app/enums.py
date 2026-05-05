from enum import Enum


class GameSessionStatusEnum(str, Enum):
    # idle -> [ question -> question с correct -> ranking  -> т.д. для каждого вопроса] -> leaderboard -> idle
    IDLE = "idle"
    QUESTION = "question"
    QUESTION_WITH_ANSWERS = "question_with_answers"
    RANKING = "ranking"
    LEADERBOARD = "leaderboard"
    INACTIVE = "inactive"
