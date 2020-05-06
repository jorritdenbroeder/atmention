import { Pipe, PipeTransform } from '@angular/core';
import * as atmention from 'atmention-core';


@Pipe({
  name: 'atmentionParse'
})
export class AtmentionParse implements PipeTransform {

  transform(markup: string) {
    return atmention.parse(markup);
  }

}
