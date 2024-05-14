import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Document } from '@langchain/core/documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { MessagesPlaceholder } from '@langchain/core/prompts';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

@Injectable()
export class LangchainService {
  private chatModel: ChatOpenAI;

  constructor(private configService: ConfigService) {
    this.chatModel = new ChatOpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 150,
    });
  }

  async test() {
    const loader = new CheerioWebBaseLoader(
      'https://docs.smith.langchain.com/user_guide',
    );
    const docs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter();
    const splitDocs = await splitter.splitDocuments(docs);
    const embeddings = new OpenAIEmbeddings();

    const vectorstore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      embeddings,
    );

    const prompt = ChatPromptTemplate.fromTemplate(`
      Answer the following question based only on the provided context:
      <context>
      {context}
      </context>

      Question: {input}`);

    const documentChain = await createStuffDocumentsChain({
      llm: this.chatModel,
      prompt,
    });

    await documentChain.invoke({
      input: 'what is LangSmith?',
      context: [
        new Document({
          pageContent:
            'LangSmith is a platform for building production-grade LLM applications.',
        }),
      ],
    });

    const retriever = vectorstore.asRetriever();

    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder('chat_history'),
      ['user', '{input}'],
      [
        'user',
        'Given the above conversation, generate a search query to look up in order to get information relevant to the conversation',
      ],
    ]);

    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
      llm: this.chatModel,
      retriever,
      rephrasePrompt: historyAwarePrompt,
    });

    const chatHistory = [
      new HumanMessage('Can LangSmith help test my LLM applications?'),
      new AIMessage('Yes!'),
    ];

    await historyAwareRetrieverChain.invoke({
      chat_history: chatHistory,
      input: 'Tell me how!',
    });

    const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        "Answer the user's questions based on the below context:\n\n{context}",
      ],
      new MessagesPlaceholder('chat_history'),
      ['user', '{input}'],
    ]);

    const historyAwareCombineDocsChain = await createStuffDocumentsChain({
      llm: this.chatModel,
      prompt: historyAwareRetrievalPrompt,
    });

    const conversationalRetrievalChain = await createRetrievalChain({
      retriever: historyAwareRetrieverChain,
      combineDocsChain: historyAwareCombineDocsChain,
    });

    const result2 = await conversationalRetrievalChain.invoke({
      chat_history: [
        new HumanMessage('Can LangSmith help test my LLM applications?'),
        new AIMessage('Yes!'),
      ],
      input: 'tell me how',
    });

    console.log(result2.answer);

    return null;
  }
}
