const $ = require("jquery");
import { AnnotationRect } from "@iiif/manifold";
import { SearchHit } from "../uv-shared-module/SearchHit";
import { Keyboard, Strings } from "../../Utils";
import * as KeyCodes from "@edsilv/key-codes";
import { Events } from "../../../../Events";
import { IIIFEvents } from "../../IIIFEvents";
import OpenSeadragonExtension from "../../extensions/uv-openseadragon-extension/Extension";

export class SearchResultsView {
  $element: JQuery;
  $searchResultContainer: JQuery;
  $searchHitsContainer: JQuery;
  $searchHitsLabel: JQuery;
  $searchPagerContainer: JQuery;
  $searchPagerPrevButton: JQuery;
  $searchPagerLabel: JQuery;
  $searchPagerNextButton: JQuery;
  currentAnnotationRect: AnnotationRect | undefined;
  currentCanvasTitle: string | null;
  currentHitIndex: number;
  currentHits: number;
  extension: OpenSeadragonExtension;
  extensionHost: any;
  content: any;

  constructor(
    $element: JQuery,
    extension: OpenSeadragonExtension,
    extensionHost: any,
    content: any
  ) {
    this.$element = $element;
    this.extension = extension;
    this.extensionHost = extensionHost;
    this.content = content;
    this.currentHitIndex = 0;
    this.currentHits = 0;
    this.currentCanvasTitle = null;
  }

  setup(): void {
    this.$element.empty();

    // Search hits summary
    this.$searchHitsContainer = $('<div class="searchHitsContainer"></div>');
    this.$searchHitsLabel = $('<span class="searchHitsLabel"></span>');
    this.$searchHitsContainer.append(this.$searchHitsLabel);
    this.$searchHitsContainer.hide();
    this.$element.append(this.$searchHitsContainer);

    // Search pager
    this.$searchPagerContainer = $('<div class="searchPagerContainer"></div>');
    this.$searchPagerPrevButton = $(
      '<button class="prev" title="' +
        this.content.previousResult +
        '"></button>'
    );
    this.$searchPagerPrevButton.prop("disabled", true);
    this.$searchPagerLabel = $("<span>0 of 0</span>");
    this.$searchPagerNextButton = $(
      '<button class="next" title="' + this.content.nextResult + '"></button>'
    );
    this.$searchPagerContainer.append(this.$searchPagerPrevButton);
    this.$searchPagerContainer.append(this.$searchPagerLabel);
    this.$searchPagerContainer.append(this.$searchPagerNextButton);
    this.$searchPagerContainer.hide();
    this.$element.append(this.$searchPagerContainer);

    // Search results container
    this.$searchResultContainer = $('<div class="searchResult"></div>');
    this.$element.append(this.$searchResultContainer);

    // Event handlers
    this.$searchPagerPrevButton.on("click", () => {
      this.currentHitIndex--;
      $('.searchHitNumberSpan[data-index="' + this.currentHitIndex + '"]')
        .closest("div")[0]
        .scrollIntoView({
          behavior: "instant",
          block: "end",
          inline: "nearest",
        });
      $('.searchHitNumberSpan[data-index="' + this.currentHitIndex + '"]')
        .closest("div")
        .trigger("click");
    });

    this.$searchPagerNextButton.on("click", () => {
      this.currentHitIndex++;
      $('.searchHitNumberSpan[data-index="' + this.currentHitIndex + '"]')
        .closest("div")[0]
        .scrollIntoView({
          behavior: "instant",
          block: "end",
          inline: "nearest",
        });
      $('.searchHitNumberSpan[data-index="' + this.currentHitIndex + '"]')
        .closest("div")
        .trigger("click");
    });
  }

  show(): void {
    this.$element.show();
  }

  hide(): void {
    this.$element.hide();
  }

  displaySearchResults(searchHits?: SearchHit[], searchTerm?: string): void {
    this.$searchResultContainer.html("");
    this.currentCanvasTitle = null;

    if (!searchHits || searchHits.length === 0) {
      this.$searchHitsLabel.html(this.content.noMatches || "No matches");
      this.$searchHitsContainer.show();
      this.$searchPagerContainer.hide();
      return;
    }

    // Update hits summary
    this.currentHits = searchHits.length;
    const instanceFoundText: string = this.content.instanceFound;
    const instancesFoundText: string = this.content.instancesFound;
    let text: string = "";

    if (searchHits.length === 1 && searchTerm !== undefined) {
      if (instanceFoundText) {
        text = Strings.format(instanceFoundText, searchTerm);
      } else {
        text = `1 instance found for "${searchTerm}"`;
      }
    } else if (searchTerm !== undefined) {
      if (instancesFoundText) {
        text = Strings.format(
          instancesFoundText,
          String(searchHits.length),
          searchTerm
        );
      } else {
        text = `${searchHits.length} instances found for "${searchTerm}"`;
      }
    }
    this.$searchHitsLabel.html(text);
    this.$searchHitsContainer.show();
    this.$searchPagerContainer.show();

    // Display each search hit
    searchHits.forEach((searchHit, i) => {
      const div = $(
        '<div id="searchhit-' +
          searchHit.canvasIndex +
          "-" +
          searchHit.index +
          '" class="searchHit" data-canvas-index="' +
          searchHit.canvasIndex +
          '" data-index="' +
          searchHit.index +
          '" tabindex="0"></div>'
      );

      const canvasTitle = this.extension.helper
        .getCanvasByIndex(searchHit.canvasIndex)
        .getLabel()
        .getValue();

      const hitNumberSpan = $(
        '<span class="searchHitNumberSpan" data-index="' + (i + 1) + '"></span>'
      );
      hitNumberSpan.append(i + 1);

      const searchHitSpan = $(
        '<span class="searchHitSpan">' + searchHit.match + "</span>"
      );

      div.append(
        hitNumberSpan[0].outerHTML +
          searchHit.before +
          searchHitSpan[0].outerHTML +
          searchHit.after
      );

      // Keyboard handler
      $(div).on("keydown", (e: any) => {
        const originalEvent: KeyboardEvent = <KeyboardEvent>e.originalEvent;
        const charCode: number = Keyboard.getCharCode(originalEvent);
        if (charCode === KeyCodes.KeyDown.Enter) {
          e.preventDefault();
          $(e.target).trigger("click");
        }
      });

      // Click handler
      $(div).on("click", (e: any) => {
        let canvasIndex: number = 0;
        let index: number = 0;
        let hitIndex = 0;

        if (e.target.tagName.toLowerCase() === "span") {
          canvasIndex = $(e.target).closest("div").attr("data-canvas-index");
          index = $(e.target).closest("div").attr("data-index");
          hitIndex = $(e.target)
            .closest("div")
            .find(".searchHitNumberSpan")
            .attr("data-index");
        } else {
          canvasIndex = $(e.target).attr("data-canvas-index");
          index = $(e.target).attr("data-index");
          hitIndex = $(e.target)
            .find(".searchHitNumberSpan")
            .attr("data-index");
        }

        const currentRect = this.extension.annotations.find((e) => {
          return e["canvasIndex"] == canvasIndex;
        })?.rects[index];

        this.extensionHost.publish(Events.SEARCH_HIT_CHANGED, [
          {
            hitIndex: hitIndex,
            rectIndex: currentRect?.index,
            canvasIndex: currentRect?.canvasIndex,
          },
        ]);

        if (currentRect !== undefined) {
          if (
            this.currentAnnotationRect !== undefined &&
            currentRect.canvasIndex == this.currentAnnotationRect.canvasIndex
          ) {
            this.canvasIndexChanged(canvasIndex, index);
            return;
          }
          this.currentAnnotationRect = currentRect;
          this.extensionHost.publish(IIIFEvents.ANNOTATION_CANVAS_CHANGE, [
            currentRect,
          ]);
        }
      });

      // Add canvas title separator if needed
      if (canvasTitle !== this.currentCanvasTitle) {
        this.$searchResultContainer.append(
          $('<div class="canvasTitle">' + canvasTitle + "</div>")
        );
      }
      this.currentCanvasTitle = canvasTitle;
      this.$searchResultContainer.append(div);
    });
  }

  canvasIndexChanged(canvasIndex: number, index: number): void {
    $("div.searchHit").each((i: Number, searchHit: any) => {
      if ($(searchHit).hasClass("current")) {
        $(searchHit).removeClass("current");
        return;
      }
    });

    if (
      $(
        'div.searchHit[data-index="' +
          index +
          '"][data-canvas-index="' +
          canvasIndex +
          '"]'
      )[0] !== undefined
    ) {
      this.setCurrentAnnotation(canvasIndex, index);
      $(
        'div.searchHit[data-index="' +
          index +
          '"][data-canvas-index="' +
          canvasIndex +
          '"]'
      ).addClass("current");
      $(
        'div.searchHit[data-index="' +
          index +
          '"][data-canvas-index="' +
          canvasIndex +
          '"]'
      )[0].scrollIntoView({
        behavior: "instant",
        block: "end",
        inline: "nearest",
      });
    }
  }

  setCurrentAnnotation(canvasIndex: any, index: any): void {
    $(".annotationRect").each((i: number, annotation: any) => {
      if ($(annotation).hasClass("current")) {
        $(annotation).removeClass("current");
        return;
      }
    });
    $("div#annotation-" + canvasIndex + "-" + index).addClass("current");
  }

  updateSearchHitPager(hitIndex: number): void {
    const searchHitOf: string = this.content.searchHitOf;
    this.currentHitIndex = hitIndex;
    if (searchHitOf) {
      this.$searchPagerLabel.html(
        Strings.format(
          searchHitOf,
          String(this.currentHitIndex),
          String(this.currentHits)
        )
      );
    } else {
      this.$searchPagerLabel.html(
        `${this.currentHitIndex} of ${this.currentHits}`
      );
    }
    this.$searchPagerPrevButton.prop("disabled", false);
    this.$searchPagerNextButton.prop("disabled", false);
    if (this.currentHitIndex == 1) {
      this.$searchPagerPrevButton.prop("disabled", true);
    } else if (this.currentHitIndex == this.currentHits) {
      this.$searchPagerNextButton.prop("disabled", true);
    }
  }

  clear(): void {
    this.$searchResultContainer.html("");
    this.$searchHitsLabel.text("");
    this.$searchHitsContainer.hide();
    this.$searchPagerContainer.hide();
    this.currentCanvasTitle = null;
    this.currentHitIndex = 0;
    this.currentHits = 0;
  }
}
