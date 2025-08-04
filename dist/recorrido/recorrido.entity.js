var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
export let Recorrido = class Recorrido extends BaseEntity {
};
__decorate([
    Property({ nullable: false }),
    __metadata("design:type", String)
], Recorrido.prototype, "ciudadSalida", void 0);
__decorate([
    Property({ nullable: false }),
    __metadata("design:type", String)
], Recorrido.prototype, "ciudadLlegada", void 0);
__decorate([
    Property({ nullable: false }),
    __metadata("design:type", Number)
], Recorrido.prototype, "totalKm", void 0);
Recorrido = __decorate([
    Entity()
], Recorrido);
//# sourceMappingURL=recorrido.entity.js.map