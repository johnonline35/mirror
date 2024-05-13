import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

@Injectable()
export class LangchainService {
  private chatModel: ChatOpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('API key for OpenAI not found');
    }

    this.chatModel = new ChatOpenAI({
      apiKey: apiKey,
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

    console.log(splitDocs.length);
    console.log(splitDocs[0].pageContent.length);

    return null;
  }
}
