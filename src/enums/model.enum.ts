/**
 * Model Type Enumeration
 * 
 * Defines the three types of AI models supported in the system.
 */
export enum ModelType {
    LLM = 'llm',
    STT = 'stt',
    TTS = 'tts',
}

/**
 * LLM Provider Enumeration
 * 
 * Supported Large Language Model providers.
 */
export enum LLMProvider {
    OPENAI = 'openai',
    ANTHROPIC = 'anthropic',
    GOOGLE = 'google',
    MISTRAL = 'mistral',
    COHERE = 'cohere',
    GROQ = 'groq',
    TOGETHER_AI = 'together_ai',
    CUSTOM = 'custom',
}

/**
 * STT Provider Enumeration
 * 
 * Supported Speech-to-Text providers.
 */
export enum STTProvider {
    OPENAI_WHISPER = 'openai_whisper',
    GOOGLE_SPEECH = 'google_speech',
    AZURE_SPEECH = 'azure_speech',
    ASSEMBLY_AI = 'assembly_ai',
    DEEPGRAM = 'deepgram',
    CUSTOM = 'custom',
}

/**
 * TTS Provider Enumeration
 * 
 * Supported Text-to-Speech providers.
 */
export enum TTSProvider {
    OPENAI_TTS = 'openai_tts',
    ELEVENLABS = 'elevenlabs',
    GOOGLE_TTS = 'google_tts',
    AZURE_TTS = 'azure_tts',
    PLAY_HT = 'play_ht',
    CUSTOM = 'custom',
}

/**
 * OpenAI LLM Models
 */
export enum OpenAIModel {
    GPT_4O = 'gpt-4o',
    GPT_4O_MINI = 'gpt-4o-mini',
    GPT_4_TURBO = 'gpt-4-turbo',
    GPT_4 = 'gpt-4',
    GPT_35_TURBO = 'gpt-3.5-turbo',
    O1_PREVIEW = 'o1-preview',
    O1_MINI = 'o1-mini',
}

/**
 * Anthropic Claude Models
 */
export enum AnthropicModel {
    CLAUDE_3_5_SONNET = 'claude-3-5-sonnet-20241022',
    CLAUDE_3_OPUS = 'claude-3-opus-20240229',
    CLAUDE_3_SONNET = 'claude-3-sonnet-20240229',
    CLAUDE_3_HAIKU = 'claude-3-haiku-20240307',
}

/**
 * Google Gemini Models
 */
export enum GoogleModel {
    GEMINI_2_0_FLASH_EXP = 'gemini-2.0-flash-exp',
    GEMINI_EXP_1206 = 'gemini-exp-1206',
    GEMINI_1_5_PRO = 'gemini-1.5-pro',
    GEMINI_1_5_FLASH = 'gemini-1.5-flash',
    GEMINI_1_5_FLASH_8B = 'gemini-1.5-flash-8b',
}

/**
 * Mistral Models
 */
export enum MistralModel {
    MISTRAL_LARGE = 'mistral-large-latest',
    MISTRAL_MEDIUM = 'mistral-medium-latest',
    MISTRAL_SMALL = 'mistral-small-latest',
    MIXTRAL_8X7B = 'open-mixtral-8x7b',
    MIXTRAL_8X22B = 'open-mixtral-8x22b',
}

/**
 * Cohere Models
 */
export enum CohereModel {
    COMMAND_R_PLUS = 'command-r-plus',
    COMMAND_R = 'command-r',
    COMMAND = 'command',
    COMMAND_LIGHT = 'command-light',
}

/**
 * Groq Models
 */
export enum GroqModel {
    LLAMA_3_1_70B = 'llama-3.1-70b-versatile',
    LLAMA_3_1_8B = 'llama-3.1-8b-instant',
    MIXTRAL_8X7B = 'mixtral-8x7b-32768',
    GEMMA_7B = 'gemma-7b-it',
}

/**
 * OpenAI Whisper Models
 */
export enum OpenAIWhisperModel {
    WHISPER_1 = 'whisper-1',
}

/**
 * Google Speech Models
 */
export enum GoogleSpeechModel {
    CHIRP_2 = 'chirp_2',
    CHIRP = 'chirp',
    LATEST_LONG = 'latest_long',
    LATEST_SHORT = 'latest_short',
}

/**
 * Deepgram Models
 */
export enum DeepgramModel {
    NOVA_2 = 'nova-2',
    NOVA = 'nova',
    ENHANCED = 'enhanced',
    BASE = 'base',
}

/**
 * OpenAI TTS Models
 */
export enum OpenAITTSModel {
    TTS_1 = 'tts-1',
    TTS_1_HD = 'tts-1-hd',
}

/**
 * ElevenLabs Models
 */
export enum ElevenLabsModel {
    ELEVEN_MULTILINGUAL_V2 = 'eleven_multilingual_v2',
    ELEVEN_TURBO_V2 = 'eleven_turbo_v2',
    ELEVEN_MONOLINGUAL_V1 = 'eleven_monolingual_v1',
}

/**
 * Model Error Codes
 */
export enum ModelErrorCode {
    NOT_FOUND = 'MODEL_NOT_FOUND',
    ALREADY_EXISTS = 'MODEL_ALREADY_EXISTS',
    VALIDATION_ERROR = 'MODEL_VALIDATION_ERROR',
    INVALID_CONFIGURATION = 'MODEL_INVALID_CONFIGURATION',
    VAULT_KEY_NOT_FOUND = 'MODEL_VAULT_KEY_NOT_FOUND',
    DATABASE_ERROR = 'MODEL_DATABASE_ERROR',
}
