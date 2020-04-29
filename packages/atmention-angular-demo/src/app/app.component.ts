import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public data = [
    {
      name: 'Wim',
      id: 'wim@example.com'
    },
    {
      name: 'Menno',
      id: 'menno@example.com'
    },
    {
      name: 'Corné',
      id: 'corne@example.com'
    },
    {
      name: 'D\'Agostino',
      id: 'dagostino@example.com'
    },
  ];

  public markup = 'Hi, [Wim](person:123) and [Alex](person:456)!';

  search(query) {
    console.log('ON SEARCH', query);

    return setTimeout(() => {
      return this.data.filter(function (item) {
        return query === 'all' || item.name.toLowerCase().startsWith(query);
      })
      .map(function (item) {
        return {
          suggestion: '<b>' + item.name + '</b>',
          label: item.name,
          value: item.id
        };
      });
    }, 250);
  };


}
