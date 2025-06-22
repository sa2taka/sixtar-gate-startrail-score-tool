"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type Props = {
	imageBinary?: string;
	alt?: string;
	className?: string;
};

export const ImageViewer = ({ imageBinary, alt = "スクリーンショット", className }: Props) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [zoom, setZoom] = useState(1);

	if (!imageBinary) {
		return (
			<div className="flex items-center justify-center h-48 bg-gray-100 rounded-md">
				<span className="text-gray-500">画像データがありません</span>
			</div>
		);
	}

	const imageUrl = `data:image/jpeg;base64,${imageBinary}`;

	const handleZoomIn = () => {
		setZoom(prev => Math.min(prev + 0.2, 3));
	};

	const handleZoomOut = () => {
		setZoom(prev => Math.max(prev - 0.2, 0.5));
	};

	const handleReset = () => {
		setZoom(1);
	};

	const toggleExpand = () => {
		setIsExpanded(!isExpanded);
		if (!isExpanded) {
			setZoom(1);
		}
	};

	if (isExpanded) {
		return (
			<div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
				<div className="relative max-w-full max-h-full overflow-auto">
					<div className="absolute top-4 right-4 z-10 flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleZoomOut}
							disabled={zoom <= 0.5}
						>
							ズームアウト
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleReset}
						>
							リセット
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleZoomIn}
							disabled={zoom >= 3}
						>
							ズームイン
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={toggleExpand}
						>
							閉じる
						</Button>
					</div>
					<Image
						src={imageUrl}
						alt={alt}
						width={800}
						height={600}
						style={{ transform: `scale(${zoom})` }}
						className="transition-transform duration-200"
						unoptimized // Base64画像のため最適化を無効化
					/>
				</div>
			</div>
		);
	}

	return (
		<div className={`relative ${className || ""}`}>
			<Image
				src={imageUrl}
				alt={alt}
				width={400}
				height={300}
				className="w-full h-auto rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
				onClick={toggleExpand}
				unoptimized // Base64画像のため最適化を無効化
			/>
			<Button
				variant="outline"
				size="sm"
				onClick={toggleExpand}
				className="absolute top-2 right-2"
			>
				拡大表示
			</Button>
		</div>
	);
};