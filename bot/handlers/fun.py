import random
import re
from random import randint

from aiogram import Router, flags, types
from aiogram.filters import Command, CommandObject

from bot.misc.parse_numbers import generate_num

fun_router = Router()


def determine_gender(name):
    # Lists of explicit names
    woman_names = ["Настенька"]

    # Women name endings
    women_name_endings = "|".join(
        [
            "sa",
            "са",
            "ta",
            "та",
            "ша",
            "sha",
            "на",
            "na",
            "ия",
            "ia",  # existing
            "va",
            "ва",
            "ya",
            "я",
            "ina",
            "ина",
            "ka",
            "ка",
            "la",
            "ла",  # Slavic languages
            "ra",
            "ра",
            "sia",
            "сия",
            "ga",
            "га",
            "da",
            "да",
            "nia",
            "ния",
            # Slavic languages
            "lie",
            "ly",
            "lee",
            "ley",
            "la",
            "le",
            "ette",
            "elle",
            "anne",  # English language
        ]
    )

    # Check explicit list and name suffixes
    if name in woman_names or re.search(
        f"\w*({women_name_endings})(\W|$)", name, re.IGNORECASE
    ):
        return "woman"
    else:
        return "man"


def select_emoji(length, is_biba):
    # Emojis for bibas, from smallest to largest
    biba_emojis = ["🥒", "🍌", "🌽", "🥖", "🌵", "🌴"]

    # Emojis for breasts, from smallest to largest
    breast_emojis = ["🍓", "🍊", "🍎", "🥭", "🍉", "🎃"]

    # Select the appropriate list of emojis
    emojis = biba_emojis if is_biba else breast_emojis

    # Select an emoji based on length
    for size, emoji in zip((1, 5, 10, 15, 20, 25), emojis):
        if length <= size:
            return emoji

    # If none of the sizes matched, return the largest emoji
    return emojis[-1]


# Implementing rate limits
@fun_router.message(Command("gay", prefix="!/"))
@flags.rate_limit(limit=120, key="gay")
async def gay(message: types.Message, command: CommandObject):
    """Handler for the /gay command.
    In a humorous and respectful manner, the bot sends a random percentage
    reflecting a playful take on the user's alignment with a random LGBTQ+ orientation.

    Examples:
        /gay
        /gay Sam
    """
    # Reference the original message's author if it's a reply; otherwise, the command user.

    target = (
        command.args
        if command.args
        else (
            message.reply_to_message.from_user.mention_html()
            if message.reply_to_message
            else message.from_user.mention_html()
        )
    )

    percentage = randint(0, 100)

    if percentage > 30:
        phrases = [
            "🌈 {username}, ти сьогодні такий гей, що навіть єдинороги заздрять твоїй веселковості!",
            "🌈 Увага, увага! {username} офіційно отримує нагороду 'Найбільш Очевидний Гей Року'! 🏆",
            "🌈 {username}, твоя бі-сексуальність така потужна, що ти можеш звабити і хлопців, і дівчат одночасно!",
            "🌈 Трансгендерність {username} сьогодні на такому рівні, що навіть гендерні стереотипи плутаються!",
            "🌈 {username}, твоя асексуальність така сильна, що навіть секс втомився від тебе.",
            "🌈 Квір-детектор показує, що {username} - цар/цариця ЛГБТ-вечірки! Готуйтесь до шоу!",
            "🌈 {username}, твоя пансексуальність така всеохоплююча, що навіть каструлі почуваються привабливими.",
            "🌈 Новина дня: {username} офіційно визнаний найфабулознішим геєм в історії! 🌟",
        ]
    else:
        phrases = [
            "🌈 {username}, твоя гетеросексуальність така банальна, що навіть ванільне морозиво здається цікавішим!",
            "🌈 Увага, світ! {username} - найстрейтніший стрейт в історії стрейтів! Нагородіть цю людину!",
            "🌈 {username}, твоя любов до протилежної статі така передбачувана, що навіть ромкоми заздрять.",
            "🌈 Гетеро-радар показує, що {username} - суперзірка світу гетеросексуалів! Яка нудьга...",
            "🌈 {username}, твоя straight-енергія така потужна, що веселка втекла від тебе зі страху.",
            "🌈 Новина дня: {username} визнаний найбільш базовим гетеросексуалом року! Вітаємо?",
            "🌈 {username}, твоя гетеросексуальність така нецікава, що навіть твої гени позіхають.",
            "🌈 Алло, поліція стереотипів? Так, я хочу повідомити, що {username} - занадто типовий гетеро!",
        ]
    # Send the result with a random orientation
    await message.reply(random.choice(phrases).format(username=target))


@fun_router.message(Command("biba", prefix="!/"))
@flags.rate_limit(limit=60, key="fun")
async def biba(message: types.Message):
    """Хендлер, для обработки команды /biba или !biba

    В ответ, бот отправляет размер бибы

    Примеры:
        /biba
        /biba 10
        /biba 1-10
        /biba 10-1
        !biba
        !biba 10
        !biba 1-10
        !biba 10-1
    """
    # разбиваем сообщение на команду и аргументы через регулярное выражение
    command_parse = re.compile(r"(!biba|/biba) ?(-?\d*)?-?(\d+)?")
    parsed = command_parse.match(message.text)
    # генерируем размер бибы от 1 до 30 по умолчанию (если аргументы не переданы)
    length = generate_num(parsed.group(2), parsed.group(3), 1, 30)

    # если это ответ на сообщение, будем мерять бибу автора первичного сообщения
    # в противном случае, бибу того, кто использовал команду
    if message.reply_to_message:
        target = message.reply_to_message.from_user.mention_html()
    else:
        target = message.from_user.mention_html()

    gender = determine_gender(message.from_user.first_name)

    # Random chance to switch gender
    switch_chance = 20
    if random.randint(1, 100) <= switch_chance:
        gender = "man" if gender == "woman" else "woman"

    # Select an emoji for the biba or breast
    is_biba = gender == "man"
    emoji = select_emoji(length, is_biba)

    # Send message based on final gender
    if gender == "woman":
        await message.reply(f"{emoji} У {target} груди {length // 5} розміру.")
    else:
        # replace with your message for men
        await message.reply(f"{emoji} У {target} біба {length} см")


@fun_router.message(Command("nation", prefix="!/"))
@flags.rate_limit(limit=120, key="nationality")
async def nationality(message: types.Message):
    """Handler for the /nation command.
    The bot determines the user's nationality randomly and makes a sarcastic joke about it.
    """
    nationalities = {
        "індієць": "То що, ти сьогодні індієць? Мабуть, збираєшся медитувати в позі лотоса і співати мантри."
                   " Не забудь поговорити з коровами на вулиці і запитати в них поради.",
        "нігерієць": "То що, ти сьогодні нігерієць? Мабуть, плануєш розсилати спам-листи про мільйони доларів,"
                     " які тобі залишив у спадок якийсь принц."
                     " Не забудь вдягнути барвисту сорочку і танцювати під ритми афробіту.",
        "бразилець": "То що, ти сьогодні бразилець? Мабуть, збираєшся на карнавал в Ріо."
                     " Не забудь одягнути яскраві пір'я, блискітки і танцювати самбу до ранку.",
        "єгиптянин": "То що, ти сьогодні єгиптянин?"
                     " Мабуть, плануєш розгадувати таємниці пірамід і шукати скарби фараонів."
                     " Не забудь покататись на верблюді і сфотографуватись зі сфінксом.",
        "аргентинець": "То що, ти сьогодні аргентинець?"
                       " Мабуть, збираєшся на футбольний матч і кричати 'Vamos Argentina!'."
                       " Не забудь поскаржитись на уряд і економіку, як справжній аргентинець.",
        "швед": "То що, ти сьогодні швед? Мабуть, плануєш насолоджуватись лагомом і гігге."
                " Не забудь поговорити про переваги соціалізму і похвалитись своєю любов'ю до природи.",
        "українець": "То що, ти сьогодні українець? Мабуть, плануєш випити горілки і з'їсти сало."
                     " Не забудь поскаржитись на уряд і згадати про велике козацтво.",
        "американець": "То що, ти сьогодні американець? Мабуть, гамбургерів і колу хочеш."
                       " Не забудь прихопити свій улюблений бейсбольний кашкет і зброю, без них нікуди.",
        "француз": "То що, ти сьогодні француз? Мабуть, круасанів і вина хочеш."
                   " Не забудь поскаржитись на все підряд і поводитись зверхньо, як справжній француз.",
        "німець": "То що, ти сьогодні німець?"
                  " Мабуть, пива і ковбасок хочеш. Не забудь бути пунктуальним і дотримуватись правил,"
                  " навіть якщо вони безглузді.",
        "італієць": "То що, ти сьогодні італієць? Мабуть, пасти і піци хочеш."
                    " Не забудь говорити голосно, розмахувати руками і цілувати всіх в щоки.",
        "китаєць": "То що, ти сьогодні китаєць? Мабуть, рису і димсамів хочеш."
                   " Не забудь працювати по 12 годин на день і кланятись своєму боссу.",
        "мексиканець": "То що, ти сьогодні мексиканець? Мабуть, такос і текілу хочеш."
                       " Не забудь одягнути сомбреро і станцювати сальсу, навіть якщо не вмієш.",
        "австралієць": "То що, ти сьогодні австралієць? Мабуть, шашликів і пива хочеш."
                       " Не забудь погладити коалу і сказати 'g'day mate' кожному зустрічному.",
    }

    # Randomly select a nationality
    random_nationality = random.choice(list(nationalities.keys()))

    # Get the corresponding joke for the selected nationality
    joke = nationalities[random_nationality]

    target = (
        message.reply_to_message.from_user.mention_html()
        if message.reply_to_message
        else message.from_user.mention_html()
    )

    # Send the joke
    await message.reply(f"{target}, {joke}")
