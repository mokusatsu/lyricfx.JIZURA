# C34 source-native implementation design checkpoint

This is an implementation plan, not adapter acceptance. Shared transport is qualified at `native01/transport05.json`; C native record/replay is qualified at `native01/probe03.json`. Every C ID remains an ordinary layout, including vinyl/chochin. The seven center-anchor IDs in the accepted contract are unchanged.

The current explicit API is `{layoutsC:true}`. The default application path remains unchanged. OFF/manual/notation/locks/emphasis take the common legacy-preservation branch before any C source recipe. No recipe changes lyric source, cut duration, native time, full-stage W/H, or source enter/exit effects. Unsupported parameters and incomplete per-ID adapters are explicitly diagnosed. Their fallback rendering preserves source lyrics; it does not count as safe or selected replacement.

## Ownership and strategy inventory

All visible lyric-bearing events, real secondary copy, native metadata and their owned plates start as primary. `mainDraw` absence is never an exemption. Greeked pseudo-copy is a shape, still owned by the native paper. Classification as tiled auxiliary requires a separate review of the actual repetitive purpose; this checkpoint exempts none. The inventory JSON records the initial source call/Canvas operations for all 34.

A shared solver/recorder is appropriate, but it cannot certify an ID until its source identity, source text/shape/clock mapping, physical attachment and interval domain are established. The strategy orders below are proposals; each will receive actual attempts and outcomes. Static hold geometry, a moving source entry/exit window, and persistent source motion must remain separate.

| ID | Protected native units / intent | Candidate order after native intact translation | Source proof concern |
|---|---|---|---|
| magazine | Facing pages, gutter, A headline/deck/folio, B body/photo/folio/back | Page/gutter spacing; page aspect/content reflow; discrete page/font size | Page B fold and blank backside; bodyRows/vbody real copies; portrait page order |
| headlineDeck | Headline, deck, kicker/metadata, rules | Editorial measure/spacing; native-size rebreak; discrete type sizes | Secondary deck/romaji and lines remain attached |
| contents | Numbered ordered entries/leaders/header/footer | Entry pitch/measure; ordered row/column flow; discrete sizes | Number/leader/entry pairing and source order |
| footnote | Main block, note markers, footnote and rule | Main/note block spacing/reflow; discrete primary sizes | Real note/marker linkage and separator |
| proofread | Main text with proofreading marks/marginal copy | Main measure; attached annotation spacing; discrete sizes | Source correction mark anchors must follow exact glyph positions |
| numbered | Ordered number+lyric blocks | Number-column and block pitch; ordered flow; discrete sizes | Number/text attachment and native mi per block |
| poster | Headline/field, kicker, secondary credits | Headline measure/row rhythm; letter spacing; discrete sizes | Large poster field versus independent stage background must be explicitly resolved |
| swissGrid | Ordered typographic cells/numbers/grid rules | Grid gap/cell span; retained reading grid; discrete sizes | No arbitrary free scatter of cells |
| dictionary | Headword, reading/definition/metadata/rules | Definition measure/headword spacing; discrete sizes | All real definition/reading copies preserved |
| ema | Wooden plaque/cord/inscription/seal | Plaque aspect/inscription measure; discrete plaque/type sizes | Native swinging/entry transform, wood curves and cord ownership |
| ransom | Cut-paper glyph units | Ordered glyph-paper pitch/rows; discrete paper/type sizes | Per-glyph source occurrence, paper shape and slap clock |
| newspaper | Sheet/masthead/headline/tiers/photo/folio | Headline/column measures, page aspect; discrete sheet/type sizes | Native spin, print tier topology, all real metadata |
| vinyl | Native disc/label/radial metadata/tonearm or sleeve/disc pair | Disc-sleeve spacing; owned-object size; label measure | Label native rotation; disc groove/sheen; tonearm; never center-only |
| cassette | Body/reels/label/inscription/side metadata | Label measure/body proportions within cassette shape; discrete size | Reel rotations and inscription-label attachment |
| bookSpine | Hero inscription spine and neighboring books/shelf or pile | Ordered spine/pile spacing; hero inscription measure; discrete books | Shelf vs pile topology and hero lift phase |
| polaroid | Ordered photo cards, image lyric and caption | Card spacing/ordered overlap; image/caption measure; discrete cards | Development phase and each card's native clock |
| stampSheet | Perforated sheet/hero stamp/metadata | Sheet pitch/hero stamp measure; discrete stamps | Hero vs decorative stamps and perforation ownership |
| postcard | Card/address/stamp/main inscription | Address/content zones; inscription reflow; discrete card size | Vertical right-to-left inscription and address/stamp regions |
| letterPaper | Sheet/rules/inscription/header | Native writing pitch/measure; discrete paper/type | Writing line correspondence, vertical/horizontal variants |
| calendar | Binding/date sheet/main lyric/numbers | Sheet/date/lyric measure; discrete calendar size | Page turn/tear/backside and date typography |
| chochin | Lantern body/ribs/caps/inscriptions | Lantern spacing; inscription setting; discrete lantern size | Rib curves, native sway, complete per-lantern inscription order |
| routeMap | Route segments/station nodes/names/reading | Station pitch/path bends; attached label measure; discrete labels | Station/node/reading linkage and route reading order |
| stationSign | Main sign/stripe/neighbor names/reading | Sign/text measure; discrete sign/type size | Neighbor names and directional relation |
| noren | Rod/fabric panels/inscriptions/crest | Ordered panel spacing/rod attachment; discrete panels | Each native flap/entry clock; right-to-left inscription order |
| tanzaku | Branch/cords/paper strips/inscriptions | Ordered strip pitch/cord anchors; discrete strips/type | Continuous sway; blank strips/leaves are named source decorations, no implicit omission |
| omikuji | Fortune paper/headings/categories/main inscription | Native paper measure/inscription columns; discrete size | Fortune/category/calligraphy attachment and opening phase |
| kakejiku | Scroll cloth/paper/rods/inscription/seal | Scroll writing measure; discrete owned scroll size | Reveal clip, roll/rod linkage, native vertical reading |
| shoji | Screen lattice/paper, silhouette or revealed foreground lyric | Source foreground/silhouette position and panel opening spacing | Full-stage screen ownership vs independent background needs explicit resolution; shadow filter not certified |
| clapper | Slate/clapping sticks/grid/fields/main lyric | Slate lyric/field measures; discrete slate/type size | Hinge angle/snap/shake and every field value retained |
| warningLabel | Label/hazard stripes/symbol/heading/lyric | Label/heading/lyric measure; discrete label size | Flash/symbol/stripe clock and physical zones |
| priceTag | Tag/string/hole/price-type metadata/lyric | Tag writing measure; discrete tag/type size | Swing/string anchors and all price metadata |
| nameTag | Badge/clip/header/inscription | Badge/header/inscription measure; discrete badge/type size | Clip/body connection and entry turn |
| stickyNotes | Per-note paper/fold/shadow/pin/source chunk | Native ordered slot pitch; discrete note/font size with ordered slots | Native squash and peel clocks; native note count/chunk order fixed |
| karuta | Ordered cards/initials/inscriptions | Ordered card pitch/overlap; discrete card/type size | Native card face/back/flip phases and reading initials |

## First adapter: stickyNotes

The source note count, chunks and their order, native font roles, pin, paper/fold/shadow primitive kinds, source `mi` clocks and cascade/scatter slope remain invariant. Native-size cluster translation is tried first. Native-size slot pitch candidates follow. Discrete physical note/font ratios `.95,.9,.85,.8,.75,.7` follow, with the same ordered slot pitch choices; an explicit size cannot receive these reduction candidates. This changes actual source notes and slots in full stage coordinates, never the dimensions of `makeEnv` or a viewport for the complete effect. Every trial is recorded from the same native renderer.

The native source gives note `i` an entry start `.03+i*.13` and an entry squash that finishes after `.22`. After the last note settles and before `cut.end-outDur`, `sq=1`, `peel=0`, source angles, source slots and source font sizes are fixed. These fixed polygons receive the common camera/ghost/AA envelope. Native entry and exit remain separate relaxed outcomes; they are not claimed as full-interval circle avoidance. A hold shorter than `.04s` is unsupported, not an all-relaxed success.

Current `sticky01/probe02.json` has 18 exploratory conditions. Single-note normal-radius cases succeed in landscape and portrait, including native typography at 1920×1080 and source resizing at lower resolution/portrait. The three-note long-text normal-radius cases remain insufficient. This is the current recipe search limit, not a proof of physical impossibility. Independent visual judgement, native MP4 comparisons, broader annotation/font cases and the other 33 adapters remain unfinished.
