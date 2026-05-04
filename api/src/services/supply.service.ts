import mongoose from "mongoose";
import { AppError } from "../middlewares/error.middleware.js";
import { Resource, ResourceCategory } from "../models/resource.model.js";
import {
    ISupply,
    Supply,
    SupplyDropStatus
} from "../models/supply.model.js";
import type {
    CollectSupplyInput,
    CreateSupplyInput,
    UpdateSupplyInput
} from "../schemas/supply.schema.js";
import { calculatePagination } from "../utils/pagination.js";

export class SupplyService {
  /**
   * Map content string to ResourceCategory
   */
  private mapContentToCategory(content: string): ResourceCategory {
    const lower = content.toLowerCase().trim();
    if (lower === "oxigeno") return ResourceCategory.OXIGENO;
    if (lower === "agua") return ResourceCategory.AGUA;
    if (lower === "comida") return ResourceCategory.COMIDA;
    if (lower === "medicinas" || lower === "medico")
      return ResourceCategory.MEDICO;
    if (lower === "herramientas" || lower === "equipo")
      return ResourceCategory.EQUIPO;
    return ResourceCategory.OTRO;
  }

  /**
   * Create a new supply
   */
  async create(userId: string, input: CreateSupplyInput) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const supply = await Supply.create({
      ...input,
      userId: userObjectId,
      status: SupplyDropStatus.PENDIENTE,
    });

    return supply;
  }

  /**
   * Find all supplies for a user with pagination and optional status filter
   */
  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: SupplyDropStatus,
  ) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, any> = { userId: userObjectId };
    if (status) {
      filter.status = status;
    }

    const [supplies, total] = await Promise.all([
      Supply.find(filter)
        .sort({ lastModified: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Supply.countDocuments(filter),
    ]);

    const pagination = calculatePagination(page, limit, total);

    return {
      supplies,
      pagination,
    };
  }

  /**
   * Find a single supply by ID
  SupplyDropStatus
   */
  async findOne(userId: string, supplyId: string): Promise<ISupply> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const supply = await Supply.findOne({
      _id: new mongoose.Types.ObjectId(supplyId),
      userId: userObjectId,
    });

    if (!supply) {
      throw new AppError("Supply not found", 404);
    }

    return supply;
  }

  /**
   * Collect a supply (status: pendiente -> recogido)
   * Also creates/updates astronaut resources for each content item
   */
  async collect(
    userId: string,
    supplyId: string,
    input?: CollectSupplyInput,
  ): Promise<ISupply> {
    const supply = await this.findOne(userId, supplyId);
    console.log(
      `[COLLECT] Supply found: ${supply._id}, contents: ${JSON.stringify(supply.contents)}`,
    );

    if (
      supply.status !== SupplyDropStatus.PENDIENTE &&
      supply.status !== SupplyDropStatus.ENTREGADO
    ) {
      throw new AppError(
        `Cannot collect supply with status ${supply.status}. Only 'pendiente' or 'entregado' supplies can be collected.`,
        400,
      );
    }

    const collectedAt = input?.collectedAt
      ? new Date(input.collectedAt)
      : new Date();

    const updated = await Supply.findByIdAndUpdate(
      new mongoose.Types.ObjectId(supplyId),
      {
        status: SupplyDropStatus.RECOGIDO,
        collectedAt,
        lastModified: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!updated) {
      throw new AppError("Supply not found", 404);
    }

    // Process contents - create/update resources for astronaut
    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (supply.contents && supply.contents.length > 0) {
      console.log(
        `[COLLECT] Processing ${supply.contents.length} contents for user ${userId}`,
      );
      for (const content of supply.contents) {
        try {
          const category = this.mapContentToCategory(content);
          const resourceName =
            category.charAt(0).toUpperCase() + category.slice(1);
          console.log(
            `[COLLECT] Content: ${content} → Category: ${category}, ResourceName: ${resourceName}`,
          );

          // Find or create resource
          const existingResource = await Resource.findOne({
            userId: userObjectId,
            category: category,
          });

          if (existingResource) {
            console.log(
              `[COLLECT] Found existing resource: ${existingResource._id}, amount: ${existingResource.currentAmount} → ${existingResource.currentAmount + 1}`,
            );
            // Increment existing resource
            const updated = await Resource.findByIdAndUpdate(
              existingResource._id,
              {
                currentAmount: existingResource.currentAmount + 1,
                lastModified: new Date(),
                $push: {
                  movements: {
                    type: "ingreso",
                    amount: 1,
                    notes: `Collected from supply ${supply.name}`,
                    timestamp: new Date(),
                    previousAmount: existingResource.currentAmount,
                    newAmount: existingResource.currentAmount + 1,
                  },
                },
              },
              { new: true },
            );
            console.log(
              `[COLLECT] Updated resource: ${JSON.stringify(updated?.currentAmount)}`,
            );
          } else {
            console.log(
              `[COLLECT] Creating new resource: ${resourceName} (${category})`,
            );
            // Create new resource
            const created = await Resource.create({
              name: resourceName,
              category: category,
              currentAmount: 1,
              unit: "units",
              threshold: 0,
              userId: userObjectId,
              movements: [
                {
                  type: "ingreso",
                  amount: 1,
                  notes: `Collected from supply ${supply.name}`,
                  timestamp: new Date(),
                  previousAmount: 0,
                  newAmount: 1,
                },
              ],
            });
            console.log(`[COLLECT] Created resource: ${created._id}`);
          }
        } catch (err) {
          console.error(`[COLLECT] Error processing content ${content}:`, err);
        }
      }
    }

    return updated;
  }

  /**
   * Update a supply (partial update)
   */
  async update(
    userId: string,
    supplyId: string,
    input: UpdateSupplyInput,
  ): Promise<ISupply> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const existing = await Supply.findOne({
      _id: new mongoose.Types.ObjectId(supplyId),
      userId: userObjectId,
    });

    if (!existing) {
      throw new AppError("Supply not found", 404);
    }

    const updated = await Supply.findByIdAndUpdate(
      new mongoose.Types.ObjectId(supplyId),
      {
        ...input,
        lastModified: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!updated) {
      throw new AppError("Supply not found", 404);
    }

    return updated;
  }

  /**
   * Delete a supply
   */
  async delete(userId: string, supplyId: string): Promise<void> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const existing = await Supply.findOne({
      _id: new mongoose.Types.ObjectId(supplyId),
      userId: userObjectId,
    });

    if (!existing) {
      throw new AppError("Supply not found", 404);
    }

    await Supply.findByIdAndDelete(new mongoose.Types.ObjectId(supplyId));
  }

  /**
   * Expire a supply (status: pendiente -> expirado)
   */
  async expire(supplyId: string): Promise<ISupply> {
    const supply = await Supply.findById(new mongoose.Types.ObjectId(supplyId));

    if (!supply) {
      throw new AppError("Supply not found", 404);
    }

    if (supply.status !== SupplyDropStatus.PENDIENTE) {
      throw new AppError(
        `Cannot expire supply with status ${supply.status}. Only 'pendiente' supplies can be expired.`,
        400,
      );
    }

    const updated = await Supply.findByIdAndUpdate(
      new mongoose.Types.ObjectId(supplyId),
      {
        status: SupplyDropStatus.EXPIRADO,
        lastModified: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!updated) {
      throw new AppError("Supply not found", 404);
    }

    return updated;
  }

  /**
   * Find nearby supplies using geospatial query
   */
  async findNearby(
    userId: string,
    lat: number,
    lng: number,
    radius: number = 1000,
    status?: SupplyDropStatus,
  ) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Build filter with geospatial query
    const filter: Record<string, unknown> = {
      userId: userObjectId,
      location: {
        $geoWithin: {
          $centerSphere: [
            [lng, lat], // GeoJSON uses [lng, lat] order
            radius / 6378100, // Convert meters to radians (Earth radius in meters ≈ 6378100)
          ],
        },
      },
    };

    if (status) {
      filter.status = status;
    }

    const supplies = await Supply.find(filter).lean();

    return supplies;
  }
}

export const supplyService = new SupplyService();
