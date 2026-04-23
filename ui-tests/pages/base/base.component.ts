import { Locator } from '@playwright/test';

export class BaseComponent {
    protected readonly root: Locator;
    
    constructor(root: Locator) {
        this.root = root;
    }
    
    locator(selector: string): Locator {
        return this.root.locator(selector);
    }
    
    getRoot(): Locator {
        return this.root;
    }
}