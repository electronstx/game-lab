import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameObjects } from '../../../src/view/game-objects/game-objects.js';
import type { GameObject } from '../../../src/view/game-objects/types.js';

describe('GameObjects', () => {
    let gameObjects: GameObjects;
    let mockObject1: GameObject;
    let mockObject2: GameObject;

    beforeEach(() => {
        gameObjects = new GameObjects();

        mockObject1 = {
            create: vi.fn(),
            show: vi.fn(),
            hide: vi.fn(),
            update: vi.fn(),
            reset: vi.fn(),
            destroy: vi.fn(),
        };

        mockObject2 = {
            create: vi.fn(),
            show: vi.fn(),
            hide: vi.fn(),
            update: vi.fn(),
            reset: vi.fn(),
        };
    });

    describe('addObject', () => {
        it('should add an object', () => {
            gameObjects.addObject(mockObject1);
            gameObjects.create('arg1', 'arg2');

            expect(mockObject1.create).toHaveBeenCalledWith('arg1', 'arg2');
        });

        it('should add multiple objects', () => {
            gameObjects.addObject(mockObject1);
            gameObjects.addObject(mockObject2);
            gameObjects.create('test');

            expect(mockObject1.create).toHaveBeenCalledWith('test');
            expect(mockObject2.create).toHaveBeenCalledWith('test');
        });

        it('should not add null or undefined objects', () => {
            gameObjects.addObject(null as unknown as GameObject);
            gameObjects.addObject(undefined as unknown as GameObject);

            gameObjects.create();
            expect(mockObject1.create).not.toHaveBeenCalled();
        });

        it('should preserve order of added objects', () => {
            gameObjects.addObject(mockObject1);
            gameObjects.addObject(mockObject2);

            const createOrder: GameObject[] = [];
            mockObject1.create = vi.fn(() => createOrder.push(mockObject1));
            mockObject2.create = vi.fn(() => createOrder.push(mockObject2));

            gameObjects.create();

            expect(createOrder[0]).toBe(mockObject1);
            expect(createOrder[1]).toBe(mockObject2);
        });
    });

    describe('create', () => {
        it('should call create on all objects with arguments', () => {
            gameObjects.addObject(mockObject1);
            gameObjects.addObject(mockObject2);
            gameObjects.create('arg1', 123, { data: 'test' });

            expect(mockObject1.create).toHaveBeenCalledWith('arg1', 123, { data: 'test' });
            expect(mockObject2.create).toHaveBeenCalledWith('arg1', 123, { data: 'test' });
        });

        it('should handle create when no objects are added', () => {
            expect(() => gameObjects.create()).not.toThrow();
        });

        it('should handle create with no arguments', () => {
            gameObjects.addObject(mockObject1);
            gameObjects.create();

            expect(mockObject1.create).toHaveBeenCalledWith();
        });

        it('should handle object without create method', () => {
            const objectWithoutCreate = {
                show: vi.fn(),
            } as unknown as GameObject;

            gameObjects.addObject(objectWithoutCreate);
            expect(() => gameObjects.create()).not.toThrow();
        });
    });

    describe('show', () => {
        it('should call show on all objects', () => {
            gameObjects.addObject(mockObject1);
            gameObjects.addObject(mockObject2);
            gameObjects.show();

            expect(mockObject1.show).toHaveBeenCalled();
            expect(mockObject2.show).toHaveBeenCalled();
        });

        it('should handle show when no objects are added', () => {
            expect(() => gameObjects.show()).not.toThrow();
        });

        it('should handle object without show method', () => {
            const objectWithoutShow = {
                create: vi.fn(),
                hide: vi.fn(),
            } as GameObject;

            gameObjects.addObject(objectWithoutShow);
            expect(() => gameObjects.show()).not.toThrow();
        });
    });

    describe('hide', () => {
        it('should call hide on all objects', () => {
            gameObjects.addObject(mockObject1);
            gameObjects.addObject(mockObject2);
            gameObjects.hide();

            expect(mockObject1.hide).toHaveBeenCalled();
            expect(mockObject2.hide).toHaveBeenCalled();
        });

        it('should handle hide when no objects are added', () => {
            expect(() => gameObjects.hide()).not.toThrow();
        });

        it('should handle object without hide method', () => {
            const objectWithoutHide = {
                create: vi.fn(),
                show: vi.fn(),
            } as GameObject;

            gameObjects.addObject(objectWithoutHide);
            expect(() => gameObjects.hide()).not.toThrow();
        });
    });

    describe('update', () => {
        it('should call update on all objects', () => {
            gameObjects.addObject(mockObject1);
            gameObjects.addObject(mockObject2);
            gameObjects.update();

            expect(mockObject1.update).toHaveBeenCalled();
            expect(mockObject2.update).toHaveBeenCalled();
        });

        it('should handle update when no objects are added', () => {
            expect(() => gameObjects.update()).not.toThrow();
        });

        it('should handle object without update method', () => {
            const objectWithoutUpdate = {
                create: vi.fn(),
                show: vi.fn(),
            } as GameObject;

            gameObjects.addObject(objectWithoutUpdate);
            expect(() => gameObjects.update()).not.toThrow();
        });

        it('should handle multiple update calls', () => {
            gameObjects.addObject(mockObject1);
            gameObjects.update();
            gameObjects.update();
            gameObjects.update();

            expect(mockObject1.update).toHaveBeenCalledTimes(3);
        });
    });

    describe('reset', () => {
        it('should call reset on all objects', () => {
            gameObjects.addObject(mockObject1);
            gameObjects.addObject(mockObject2);
            gameObjects.reset();

            expect(mockObject1.reset).toHaveBeenCalled();
            expect(mockObject2.reset).toHaveBeenCalled();
        });

        it('should handle reset when no objects are added', () => {
            expect(() => gameObjects.reset()).not.toThrow();
        });

        it('should handle object without reset method', () => {
            const objectWithoutReset = {
                create: vi.fn(),
                show: vi.fn(),
            } as GameObject;

            gameObjects.addObject(objectWithoutReset);
            expect(() => gameObjects.reset()).not.toThrow();
        });
    });

    describe('destroy', () => {
        it('should call destroy on all objects that have it', () => {
            gameObjects.addObject(mockObject1);
            gameObjects.addObject(mockObject2);
            gameObjects.destroy();

            expect(mockObject1.destroy).toHaveBeenCalled();
            expect(mockObject2.destroy).toBeUndefined();
        });

        it('should clear all objects after destroy', () => {
            gameObjects.addObject(mockObject1);
            gameObjects.destroy();

            gameObjects.show();
            expect(mockObject1.show).not.toHaveBeenCalled();
        });

        it('should handle destroy when no objects are added', () => {
            expect(() => gameObjects.destroy()).not.toThrow();
        });

        it('should handle destroy multiple times', () => {
            gameObjects.addObject(mockObject1);
            gameObjects.destroy();
            gameObjects.destroy();

            expect(mockObject1.destroy).toHaveBeenCalledTimes(1);
        });

        it('should handle object without destroy method', () => {
            gameObjects.addObject(mockObject2);
            expect(() => gameObjects.destroy()).not.toThrow();
        });
    });

    describe('integration', () => {
        it('should handle complete lifecycle: add, create, show, update, hide, reset, destroy', () => {
            gameObjects.addObject(mockObject1);

            gameObjects.create('arg1', 'arg2');
            expect(mockObject1.create).toHaveBeenCalledWith('arg1', 'arg2');

            gameObjects.show();
            expect(mockObject1.show).toHaveBeenCalled();

            gameObjects.update();
            expect(mockObject1.update).toHaveBeenCalled();

            gameObjects.hide();
            expect(mockObject1.hide).toHaveBeenCalled();

            gameObjects.reset();
            expect(mockObject1.reset).toHaveBeenCalled();

            gameObjects.destroy();
            expect(mockObject1.destroy).toHaveBeenCalled();
        });

        it('should handle multiple objects lifecycle', () => {
            gameObjects.addObject(mockObject1);
            gameObjects.addObject(mockObject2);

            gameObjects.create('test');
            expect(mockObject1.create).toHaveBeenCalled();
            expect(mockObject2.create).toHaveBeenCalled();

            gameObjects.show();
            expect(mockObject1.show).toHaveBeenCalled();
            expect(mockObject2.show).toHaveBeenCalled();

            gameObjects.update();
            expect(mockObject1.update).toHaveBeenCalled();
            expect(mockObject2.update).toHaveBeenCalled();

            gameObjects.hide();
            expect(mockObject1.hide).toHaveBeenCalled();
            expect(mockObject2.hide).toHaveBeenCalled();

            gameObjects.reset();
            expect(mockObject1.reset).toHaveBeenCalled();
            expect(mockObject2.reset).toHaveBeenCalled();

            gameObjects.destroy();
            expect(mockObject1.destroy).toHaveBeenCalled();
        });

        it('should handle game loop: update multiple times', () => {
            gameObjects.addObject(mockObject1);

            for (let i = 0; i < 10; i++) {
                gameObjects.update();
            }

            expect(mockObject1.update).toHaveBeenCalledTimes(10);
        });

        it('should handle show/hide toggle', () => {
            gameObjects.addObject(mockObject1);

            gameObjects.show();
            gameObjects.hide();
            gameObjects.show();
            gameObjects.hide();

            expect(mockObject1.show).toHaveBeenCalledTimes(2);
            expect(mockObject1.hide).toHaveBeenCalledTimes(2);
        });

        it('should handle objects with only required methods', () => {
            const minimalObject = {
                create: vi.fn(),
            } as GameObject;

            gameObjects.addObject(minimalObject);
            gameObjects.create();
            expect(minimalObject.create).toHaveBeenCalled();

            expect(() => gameObjects.show()).not.toThrow();
            expect(() => gameObjects.hide()).not.toThrow();
            expect(() => gameObjects.update()).not.toThrow();
            expect(() => gameObjects.reset()).not.toThrow();
            expect(() => gameObjects.destroy()).not.toThrow();
        });
    });
});