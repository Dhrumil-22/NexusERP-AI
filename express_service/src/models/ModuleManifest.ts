import mongoose, { Document, Schema } from 'mongoose';

export interface IModuleManifest extends Document {
  module_id: string;
}

const ModuleManifestSchema = new Schema<IModuleManifest>({
  module_id: { type: String, required: true, unique: true },
});

// We connect to the Django 'module_registry' collection.
export const ModuleManifest = mongoose.model<IModuleManifest>(
  'ModuleManifest',
  ModuleManifestSchema,
  'module_registry'
);
