import { Injectable, Scope } from '@nestjs/common';
import * as cheerio from 'cheerio';
import {
  TaskComponentType,
  TaskComponents,
} from '../../../interfaces/task.interface';
import { TaskComponent } from '../../../components-registry/components-registry.decorator';

@Injectable({ scope: Scope.REQUEST })
@TaskComponent(TaskComponentType.UTILITY)
export class CheerioUtilityService implements TaskComponents {
  name = 'CheerioUtility';
  description = 'Parses HTML content';
  type: TaskComponentType = TaskComponentType.UTILITY;
  /**
   * Loads HTML and returns the CheerioStatic object for further manipulation.
   * @param html The HTML string to be loaded.
   */
  load(html: string) {
    return cheerio.load(html);
  }

  /**
   * Extracts text from an element specified by a selector.
   * @param html The HTML string.
   * @param selector The CSS selector for the element.
   */
  extractText(html: string, selector: string): string {
    const $ = this.load(html);
    return $(selector).text();
  }

  /**
   * Extracts an attribute from an element specified by a selector.
   * @param html The HTML string.
   * @param selector The CSS selector for the element.
   * @param attribute The attribute name to extract.
   */
  extractAttribute(
    html: string,
    selector: string,
    attribute: string,
  ): string | undefined {
    const $ = this.load(html);
    return $(selector).attr(attribute);
  }
}