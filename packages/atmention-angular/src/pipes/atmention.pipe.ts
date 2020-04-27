import { Pipe, PipeTransform } from '@angular/core';
import * as atmention from 'atmention-core';


@Pipe({
  name: 'atmentionParse'
})
export class AtmentionParse implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return function (markup) {
      return atmention.parse(markup);
    };

  }

}
