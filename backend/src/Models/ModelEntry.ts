import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config";

type ModelEntryAttributes = {
	id: string;
	title: string;
	model: Buffer;
	videoThumbnail: Buffer;
	thumbnail: Buffer;
	color: string;
};

export interface ModelEntryInput
	extends Optional<
		ModelEntryAttributes,
		"id" | "videoThumbnail" | "thumbnail"
	> {}
export interface ModelEntryOutput extends Required<ModelEntryAttributes> {}

class ModelEntry
	extends Model<ModelEntryAttributes, ModelEntryInput>
	implements ModelEntryAttributes
{
	public id!: string;
	public title!: string;
	public model!: Buffer;
	public videoThumbnail!: Buffer;
	public thumbnail: Buffer;
	public color: string;
}

ModelEntry.init(
	{
		id: { type: DataTypes.TEXT, primaryKey: true },
		title: { type: DataTypes.TEXT },
		model: { type: DataTypes.BLOB },
		videoThumbnail: { type: DataTypes.BLOB },
		thumbnail: { type: DataTypes.BLOB },
		color: { type: DataTypes.TEXT },
	},

	{
		freezeTableName: true,
		tableName: "ModelEntries",
		sequelize,
	}
);

export default ModelEntry;
