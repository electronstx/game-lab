import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HUD } from '../../../src/view/hud/hud.js';
import type { HUDComponent } from '../../../src/view/hud/types.js';

describe('HUD', () => {
    let hud: HUD;
    let mockComponent1: HUDComponent;
    let mockComponent2: HUDComponent;

    beforeEach(() => {
        hud = new HUD();

        mockComponent1 = {
            create: vi.fn(),
            show: vi.fn(),
            hide: vi.fn(),
            destroy: vi.fn(),
        };

        mockComponent2 = {
            create: vi.fn(),
            show: vi.fn(),
            hide: vi.fn(),
        };
    });

    describe('addComponent', () => {
        it('should add a component', () => {
            hud.addComponent(mockComponent1);
            hud.create(1.5);

            expect(mockComponent1.create).toHaveBeenCalledWith(1.5);
        });

        it('should add multiple components', () => {
            hud.addComponent(mockComponent1);
            hud.addComponent(mockComponent2);
            hud.create(2.0);

            expect(mockComponent1.create).toHaveBeenCalledWith(2.0);
            expect(mockComponent2.create).toHaveBeenCalledWith(2.0);
        });

        it('should not add null or undefined components', () => {
            hud.addComponent(null as unknown as HUDComponent);
            hud.addComponent(undefined as unknown as HUDComponent);

            hud.create(1.0);
            expect(mockComponent1.create).not.toHaveBeenCalled();
        });

        it('should preserve order of added components', () => {
            hud.addComponent(mockComponent1);
            hud.addComponent(mockComponent2);

            const createOrder: HUDComponent[] = [];
            mockComponent1.create = vi.fn(() => createOrder.push(mockComponent1));
            mockComponent2.create = vi.fn(() => createOrder.push(mockComponent2));

            hud.create(1.0);

            expect(createOrder[0]).toBe(mockComponent1);
            expect(createOrder[1]).toBe(mockComponent2);
        });
    });

    describe('create', () => {
        it('should call create on all components with scale', () => {
            hud.addComponent(mockComponent1);
            hud.addComponent(mockComponent2);
            hud.create(1.5);

            expect(mockComponent1.create).toHaveBeenCalledWith(1.5);
            expect(mockComponent2.create).toHaveBeenCalledWith(1.5);
        });

        it('should handle create when no components are added', () => {
            expect(() => hud.create(1.0)).not.toThrow();
        });

        it('should handle component without create method', () => {
            const componentWithoutCreate = {
                show: vi.fn(),
                hide: vi.fn(),
            } as unknown as HUDComponent;

            hud.addComponent(componentWithoutCreate);
            expect(() => hud.create(1.0)).not.toThrow();
        });

        it('should pass scale parameter correctly', () => {
            hud.addComponent(mockComponent1);
            hud.create(2.5);

            expect(mockComponent1.create).toHaveBeenCalledWith(2.5);
        });
    });

    describe('show', () => {
        it('should call show on all components', () => {
            hud.addComponent(mockComponent1);
            hud.addComponent(mockComponent2);
            hud.show();

            expect(mockComponent1.show).toHaveBeenCalled();
            expect(mockComponent2.show).toHaveBeenCalled();
        });

        it('should handle show when no components are added', () => {
            expect(() => hud.show()).not.toThrow();
        });

        it('should handle component without show method', () => {
            const componentWithoutShow = {
                create: vi.fn(),
                hide: vi.fn(),
            } as unknown as HUDComponent;

            hud.addComponent(componentWithoutShow);
            expect(() => hud.show()).not.toThrow();
        });
    });

    describe('hide', () => {
        it('should call hide on all components', () => {
            hud.addComponent(mockComponent1);
            hud.addComponent(mockComponent2);
            hud.hide();

            expect(mockComponent1.hide).toHaveBeenCalled();
            expect(mockComponent2.hide).toHaveBeenCalled();
        });

        it('should handle hide when no components are added', () => {
            expect(() => hud.hide()).not.toThrow();
        });

        it('should handle component without hide method', () => {
            const componentWithoutHide = {
                create: vi.fn(),
                show: vi.fn(),
            } as unknown as HUDComponent;

            hud.addComponent(componentWithoutHide);
            expect(() => hud.hide()).not.toThrow();
        });
    });

    describe('destroy', () => {
        it('should call destroy on all components that have it', () => {
            hud.addComponent(mockComponent1);
            hud.addComponent(mockComponent2);
            hud.destroy();

            expect(mockComponent1.destroy).toHaveBeenCalled();
            expect(mockComponent2.destroy).toBeUndefined();
        });

        it('should clear all components after destroy', () => {
            hud.addComponent(mockComponent1);
            hud.destroy();

            hud.show();
            expect(mockComponent1.show).not.toHaveBeenCalled();
        });

        it('should handle destroy when no components are added', () => {
            expect(() => hud.destroy()).not.toThrow();
        });

        it('should handle destroy multiple times', () => {
            hud.addComponent(mockComponent1);
            hud.destroy();
            hud.destroy();

            expect(mockComponent1.destroy).toHaveBeenCalledTimes(1);
        });

        it('should handle component without destroy method', () => {
            hud.addComponent(mockComponent2);
            expect(() => hud.destroy()).not.toThrow();
        });
    });

    describe('integration', () => {
        it('should handle complete lifecycle: add, create, show, hide, destroy', () => {
            hud.addComponent(mockComponent1);
            hud.create(1.5);
            expect(mockComponent1.create).toHaveBeenCalledWith(1.5);

            hud.show();
            expect(mockComponent1.show).toHaveBeenCalled();

            hud.hide();
            expect(mockComponent1.hide).toHaveBeenCalled();

            hud.destroy();
            expect(mockComponent1.destroy).toHaveBeenCalled();
        });

        it('should handle multiple components lifecycle', () => {
            hud.addComponent(mockComponent1);
            hud.addComponent(mockComponent2);

            hud.create(2.0);
            expect(mockComponent1.create).toHaveBeenCalled();
            expect(mockComponent2.create).toHaveBeenCalled();

            hud.show();
            expect(mockComponent1.show).toHaveBeenCalled();
            expect(mockComponent2.show).toHaveBeenCalled();

            hud.hide();
            expect(mockComponent1.hide).toHaveBeenCalled();
            expect(mockComponent2.hide).toHaveBeenCalled();

            hud.destroy();
            expect(mockComponent1.destroy).toHaveBeenCalled();
        });

        it('should handle show and hide multiple times', () => {
            hud.addComponent(mockComponent1);

            hud.show();
            hud.hide();
            hud.show();
            hud.hide();

            expect(mockComponent1.show).toHaveBeenCalledTimes(2);
            expect(mockComponent1.hide).toHaveBeenCalledTimes(2);
        });
    });
});
