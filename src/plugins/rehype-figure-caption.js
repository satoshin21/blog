/**
 * 画像のみを含む段落を <figure> + <figcaption> に変換する。
 * Markdown の ![キャプション](url) の alt がキャプションとして画像の下に表示される。
 */
import { visit } from 'unist-util-visit';

export default function rehypeFigureCaption() {
	return (tree) => {
		const toReplace = [];
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName !== 'p' || !parent || index === undefined) return;
			const children = node.children || [];
			const img = children.find((n) => n.type === 'element' && n.tagName === 'img');
			const onlyImg = img && children.every((n) => n === img || (n.type === 'text' && /^\s*$/.test(n.value)));
			if (onlyImg && img.properties?.alt) {
				toReplace.push({ parent, index, img, alt: img.properties.alt });
			}
		});
		// 後ろから置換して index をずらさない
		toReplace.reverse().forEach(({ parent, index, img, alt }) => {
			const figcaption = {
				type: 'element',
				tagName: 'figcaption',
				properties: { className: ['figure-caption'] },
				children: [{ type: 'text', value: alt }],
			};
			const figure = {
				type: 'element',
				tagName: 'figure',
				properties: { className: ['figure-with-caption'] },
				children: [img, figcaption],
			};
			parent.children[index] = figure;
		});
	};
}
