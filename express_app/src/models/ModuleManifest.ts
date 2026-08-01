import mongoose, { Schema, Document } from 'mongoose';

export interface IModuleManifest extends Document {
    module_id: string;
}

const ModuleManifestSchema: Schema = new Schema({
    module_id: { type: String, required: true, unique: true }
}, { 
    collection: 'module_registry',
    strict: false // We don't care about the other fields for validation
});

// Since this collection is owned by Django, Express should only ever read from it.
export const ModuleManifest = mongoose.model<IModuleManifest>('ModuleManifest', ModuleManifestSchema);
