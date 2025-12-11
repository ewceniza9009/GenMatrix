import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemSetting extends Document {
    key: string;
    value: any;
    description?: string;
    updatedAt: Date;
}

const systemSettingSchema = new Schema<ISystemSetting>({
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true }, // Can be boolean, string, number, object
    description: { type: String },
    updatedAt: { type: Date, default: Date.now }
});

systemSettingSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model<ISystemSetting>('SystemSetting', systemSettingSchema);
