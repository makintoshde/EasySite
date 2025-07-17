from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes, CallbackQueryHandler
import logging

# Настройка логирования
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

# Токен бота (замените на ваш)
TOKEN = "8154058376:AAHAyHP7qQ4qb_XL3nRfZLNHM1OI47JuVzc"

# Ваш Telegram ID для заявок (замените на ваш ID)
ADMIN_ID = "1003491320"

# Ссылка на мини-приложение
WEB_APP_URL = "https://makintoshde.github.io/EasySite/#about"

# Команда /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    welcome_message = (
        f"Привет, {user.first_name}! 👋\n"
        "Добро пожаловать в EasySite! Я помогу заказать сайт:\n"
        "1️⃣ Нажми 'Каталог дизайнов', чтобы открыть мини-приложение.\n"
        "2️⃣ Выбери понравившийся дизайн.\n"
        "3️⃣ Напиши его название в чат.\n\n"
        "Если есть вопросы, нажми '✉️ Задать вопрос'! 😊"
    )
    keyboard = [
        [InlineKeyboardButton("📂 Каталог дизайнов", web_app=WebAppInfo(url=WEB_APP_URL))],
        [InlineKeyboardButton("❓ Помощь", callback_data="help"), InlineKeyboardButton("✉️ Задать вопрос", callback_data="ask")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(welcome_message, reply_markup=reply_markup)

# Команда /catalog
async def catalog(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("📂 Каталог дизайнов", web_app=WebAppInfo(url=WEB_APP_URL))],
        [InlineKeyboardButton("❓ Помощь", callback_data="help"), InlineKeyboardButton("✉️ Задать вопрос", callback_data="ask")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "Нажми, чтобы открыть каталог и выбрать дизайн!",
        reply_markup=reply_markup
    )

# Команда /help (для совместимости)
async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    help_message = (
        "❓ Как заказать сайт:\n"
        "1. Нажми кнопку 'Кат detergents дизайнов'.\n"
        "2. В мини-приложении выбери дизайн.\n"
        "3. Напиши название дизайна в чат.\n"
        "4. Я отправлю заявку, и с тобой свяжутся.\n\n"
        "Вопросы? Нажми '✉️ Задать вопрос'!"
    )
    await update.message.reply_text(help_message)

# Обработка нажатий на кнопки
async def button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    if query.data == "help":
        help_message = (
            "❓ Как заказать сайт:\n"
            "1. Нажми кнопку 'Каталог дизайнов'.\n"
            "2. В мини-приложении выбери дизайн.\n"
            "3. Напиши название или номер дизайна в чат.\n"
            "4. Я отправлю заявку, и с тобой свяжутся.\n\n"
            "Вопросы? Нажми '✉️ Задать вопрос'!"
        )
        await query.message.reply_text(help_message)
    elif query.data == "ask":
        context.user_data["waiting_for_question"] = True
        await query.message.reply_text("Напиши свой вопрос, и я передам его менеджеру! 😊")

# Обработка текстовых сообщений (заявки и вопросы)
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    message_text = update.message.text.strip()

    # Игнорируем команды
    if message_text.startswith("/"):
        return

    # Проверяем, ожидается ли вопрос
    if context.user_data.get("waiting_for_question", False):
        # Это вопрос
        try:
            await context.bot.send_message(
                chat_id=ADMIN_ID,
                text=f"Вопрос от {user.first_name} (@{user.username or 'без имени'}):\n{message_text}"
            )
            await update.message.reply_text(
                f"Спасибо, {user.first_name}! Твой вопрос принят. Скоро с тобой свяжутся! 😊"
            )
            context.user_data["waiting_for_question"] = False  # Сбрасываем состояние
        except Exception as e:
            logger.error(f"Ошибка при отправке вопроса: {e}")
            await update.message.reply_text(
                "😔 Ошибка. Попробуй снова или нажми 'Помощь'."
            )
    else:
        # Это заявка на дизайн
        try:
            await context.bot.send_message(
                chat_id=ADMIN_ID,
                text=f"Новая заявка!\nОт: {user.first_name} (@{user.username or 'без имени'})\nДизайн: {message_text}"
            )
            await update.message.reply_text(
                f"Спасибо, {user.first_name}! Заявка на '{message_text}' принята. Скоро с тобой свяжутся! 😊"
            )
        except Exception as e:
            logger.error(f"Ошибка при отправке заявки: {e}")
            await update.message.reply_text(
                "😔 Ошибка. Попробуй снова или нажми 'Помощь'."
            )

# Обработчик ошибок
async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logger.error(f"Ошибка: {context.error}")
    if update and update.message:
        await update.message.reply_text(
            "😔 Что-то пошло не так. Попробуй снова или нажми 'Помощь'."
        )

def main():
    # Инициализация бота
    app = Application.builder().token(TOKEN).build()

    # Регистрация обработчиков
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("catalog", catalog))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CallbackQueryHandler(button))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.add_error_handler(error_handler)

    # Запуск бота
    logger.info("Бот запущен")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()