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

  markup = 'Hi, [Wim](person:123) and [Alex](person:456)!';

  search = (query) => {
    const suggestions = this.data
      .filter(item => {
        return query === 'all' || item.name.toLowerCase().startsWith(query);
      })
      .map(item => {
        return {
          suggestion: '<b>' + item.name + '</b>',
          label: item.name,
          value: item.id
        };
      });

    return new Promise<any>(resolve => {
      setTimeout(() => resolve(suggestions), 250);
    });
  }
}
