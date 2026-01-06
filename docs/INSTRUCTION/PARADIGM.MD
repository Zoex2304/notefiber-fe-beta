Also, you may need to be reminded of the design architecture principles that I have already implemented in our current project structure. We are using the Atomic Design methodology, which means the UI is structured into atoms, molecules, organisms, and layouts.

In addition to that, I have also implemented the principles of Separation of Concerns and Decoupling.

Separation of Concerns means that each part of the system has a clear and specific responsibility. UI logic, business logic, and configuration should not be mixed together in the same place.

Decoupling means that components and modules should not be tightly dependent on one another. Each part should be able to change or evolve independently with minimal impact on the rest of the system.

Because of these principles, there should be no mixing of responsibilities and no configuration clutter across layers.

Before making any changes, you must first analyze how the current system works and how the existing components are already structured. Prioritize reusing what already exists instead of creating new components from scratch. If something truly needs to be created, that decision can be considered—but reusability and consistency should always come first, especially since the system is designed to be dynamic in nature.

Finally, only after that analysis is complete, proceed to install any additional packages or libraries that are truly required.