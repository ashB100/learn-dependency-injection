# DependencyInjection

<code>
import { Engine } from './engine';
import { Doors } from './doors';

export class Car {
    engine: Engine;
    doors: Doors;

    constructor() {
        this.engine = new Engine();
        this.doors = new Doors();
    }

    startEngine() {
        this.engine.start();
    }
}
</code>


main.ts
<code>
import { Engine } from './app/engine';
import { Doors } from './app/doors';
import { Car } from './app/car';

function main() {
    let car = new Car();

    car.startEngine();
}

main();
</code>

There are problems with this Car class in terms of maintainability, testability and scalability. Because Car knows exactly how to create instances on Engine and Doors, it is very hard to use this class in a different environment where it might need different dependency implementations. 

It is also difficult to write isolated tests for Car because there's no simple way to swap out Engine and Doors with mock classes. 

This is where Dependency injection comes into play.

Dependency injection means that all instances of needed dependencies to construct an object are passed to the objects constructor. 

car.ts
<code>
export class Car {
    constructor(private engine: Engine, private doors: Doors) {}

    startEngine() {
        this.engine.start();
    }
}
</code> 

main.ts
<code>
let engine = new Engine();
let doors = new Doors();
let car = new Car(engine, doors);

car.startEngine();
</code>

Now we moved the responsibility of creating dependencies to a higer level. Car knows nothing about how to create its dependencies. We can swap out its dependencies with mock classes when we write tests.

This works fine, but we usually deal with a lot more objects and larger applications. That is why Angular comes with a built in DI system that takes care of maintaining dependencies for us.

## Inject Angular Service into Components using Providers

### Services
When building applications, we often want to put business logic into isolated units so they ca be reused across different parts of the application. In Angular, these units are called services, and they can be implemented in may different ways. 

Our data can come from different places, so instead of hardcoding getting the data in a component it is better to have an abstraction that takes care of returning the data, no matter where it comes from. We create a data service to provide this abstraction.

One way to create a service is using a class. 

data.service.ts
<code>
export class DataService {
    items:Array<any> = [
      { id: 0, name: 'Pascal Precht', country: 'Germany'},
      { id: 1, name: 'Christoph Burgdorf', country: 'Germany'},
      { id: 2, name: 'Thomas Burleson', country: 'United States'}
    ];

    getItems() {
        return this.items;
    }
</code>

list.component.ts
<code>
import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'list-component',
  template: `
    <ul>
      <li *ngFor="let item of items">
        {{item.id}}: {{item.name}} lives in {{item.country}}
      </li>
    </ul>
  `,
  styleUrls: ['./list.component.css'],
  providers: [DataService]
})
export class ListComponent implements OnInit {
  items:Array<any>;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.items = this.dataService.getItems();
  }

}
</code>

We want to inject an instance of DataService into our ListComponent so we can use it to get our items. We import DataService. Next we add a constructor parameter with a type annotation for DataService. The type annotation is where the magic happens. It tells Angular's dependency injection to give us an instance of whatever it knows as DataService. At this point the dependency injection doesn't know what a DataService is. That is why we create a provider for DataService.

We create a provider by adding a providers property to our component, which is an array of provider definitions. 


## provide and useClass properties
When injecting services into Angular components, there are typically three things we need to do:

1. We need to import the type of what we want to inject.
2. We ask for dependency of that type in the constructor, ie, we inject the dependency.
3. We need to tell Angular how to create an instance of the type we're injecting by providing a definition of it in the provider property of the component.

Importing a type doesn't give us an instance of that type, it only pulls in the class definition which is in another file so we can use it in our own file. 

What we want to inject into our constructor however is an instance of that class. Listing our class in the providers array lets Angular create an object of that type when someone asks for it. 

<code>
    providers: [DataService]
</code>

is sugar syntax for:

<code>
    providers: [{provide: DataService, useClass: DataService}]
</code>

The provide property creates a token which we pass into the component constructors. useClass is the class that is actually used to create an object which is injected into our constructor as our component dependency.

The shorthand can only be used when the class name is the same as the token. 

list-component.ts
<code>
    import { DifferentDataService } from '../other-data.service'; // import the type
 
    // We cannot use the shorthand syntax as the strategy class is not
    // the same as the token.
    providers: [{provide: DataService, useClass: OtherDataService}]

    // inject the dependency using token, Angular will create an object 
    // of type OtherDataService and assign it to our variable dataService.
    constructor(private dataService: DataService) {
        
    }
</code>
 


## Factory Providers

log-debugger.service.ts
<code>
export class LogDebugger {
    // has a dependency of a boolean
    constructor(private enabled: boolean) {}

    debug(message) {
        if (this.enabled) {
            console.log(`DEBUG: ${message}`);
        }
    }
}
</code>

list-component.ts
<code>
  // LogDebugger needs to have a boolen passed in to enable logging
  constructor(private dataService: DataService, private log: LogDebugger) { }
</code>

app.module.ts
<code>
  providers: [
    DataService,
    {
      provide: LogDebugger,
      useFactory: () => {
        return new LogDebugger(true);
      }
    }
    ],
</code>

useFactory gets a function which returns the dependency instance we can inject later on. Inside that function, we can manually pass objects to a dependencies constructor without making these objects automatically available via DI. 

EXCEPTION: Can't resolve all parameters for LogDebugger. 

When you see an error like this, this usually means that we're requesting a dependency with a type that Angular doesn't know about. 



## Factory Providers with dependencies 

app.module.ts

<code>
import { DataService } from './data.service';

import { LogDebugger } from './log-debugger.service'

import { ConsoleService } from './console.service';

providers: [
    DataService,
    ConsoleService,
    {
      provide: LogDebugger,
      useFactory: (consoleService) => {
        return new LogDebugger(consoleService, true);
      },
      deps: [ConsoleService]
    }
],
</code>

We can list the dependencies we need for a provider factory in the dep property. We do that by creating a token. Angular will create an instance of the class which matches this token. We provide the token for this class in the providers list as well. All the dependencies which are declared through their tokens on the deps property will be injected into our factory function in the same order.  

## @Injectable

Angular uses type annotations to resolve service dependencies. This means when we're injecting a service of type DataService it's the type annotation that gives Angular all the information that's needed to create a dependency for that type. That's why the same type is used in the list of providers, to tell Angular what to inject and how that thing we want to inject is created. 

How is this metadata preserved into transpiled ES5 code?

The component class translates into a constructor function. The class methods end up in the constructor functions prototype.

Type annotations do not exist in ES5. In order to preserve that infomrmation, typescript generate two functions, __decorate and __metadata.

Decorate attaches metadata generated by decorators to objects. In fact, this is all the magic that makes decoraters in TypeScript work. The metadata function, takes care of attaching type annotations of construction parameters as part of the decoration process to objects.

dist/app/list.component.js

<code>
ListComponent = __decorate([
  core_1.Component({
    moduleId: module.id,
    selector: 'list-component',
    template " ... ",
    providers: [
      data_service_1.DataService,
      console_service_1.ConsoleService,
      {
        provide: log_debugger_service_1.LogDebugger,
        useFactory: function (consoleService) {
          return new log_debugger_service_1.LogDebugger(consoleService, true);
        },
        deps: [console_service_1.ConsoleService]
      }
    ]
  }),
  __metadata('design:paramtypes', [data_service_1.DataService, log_debugger_service_1.LogDebugger])
], ListComponent);
  return ListComponent;
</code>

The metadata function attaches that type information to our ListComponent. There can be multiple constructor parameters, this function takes a list of types whereas each type maps the constructor parameter in the order they are defined.

Typescript needs at least one decorator on a class to be able to generate the metadata. It doesn't matter if we're using a custom decorator or a decorator provided by Angular. 

Angular, however has a decorator called @Injectable that we can use in our services. 

We import it from @angular/core:

<code>
import { Injectable } from '@angular/core';

@Injectable() 
    export class DataService {//...}

</code>

## Value Providers

Dependencies are not always objects created by classes or factory functons. Sometimes we just want to inject a simple value, which can be a primitive or maybe just a configuration object. For these we can use value providers.


## OpaqueToken  

