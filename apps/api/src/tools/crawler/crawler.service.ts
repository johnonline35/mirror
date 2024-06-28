import { Injectable, Logger } from '@nestjs/common';
import { CrawlerStrategyFactory } from './strategies/crawler-strategy.factory';
import { ITask, TaskComponentType } from '../../interfaces/task.interface';
import { TaskComponent } from '../../components-registry/components-registry.decorator';
import { ITool } from '../tools.interface';

@Injectable()
@TaskComponent(TaskComponentType.TOOL)
export class CrawlerService implements ITool<ITask> {
  name = 'Crawler Service';
  description =
    'Crawls websites and does things like html extraction, image extraction, link extraction and anything else needed to get data from a website for further decision making and deeper continuous / recursive crawling';
  type: TaskComponentType = TaskComponentType.TOOL;

  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    private readonly crawlerStrategyFactory: CrawlerStrategyFactory,
  ) {}

  async execute(task: ITask, strategyType: string): Promise<any> {
    const strategy = this.crawlerStrategyFactory.getStrategy(strategyType);
    return strategy.execute(task);
  }
}
